/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

//! Implements parallel traversals over the DOM and flow trees.
//!
//! This code is highly unsafe. Keep this file small and easy to audit.

use css::matching::{ApplicableDeclarations, CannotShare, MatchMethods, StyleWasShared};
use layout::construct::FlowConstructor;
use layout::context::LayoutContext;
use layout::extra::LayoutAuxMethods;
use layout::flow::{Flow, MutableFlowUtils, PreorderFlowTraversal, PostorderFlowTraversal};
use layout::flow;
use layout::layout_task::{AssignHeightsAndStoreOverflowTraversal, AssignWidthsTraversal};
use layout::layout_task::{BubbleWidthsTraversal};
use layout::util::{LayoutDataAccess, OpaqueNodeMethods};
use layout::wrapper::{layout_node_to_unsafe_layout_node, LayoutNode, PostorderNodeMutTraversal};
use layout::wrapper::{ThreadSafeLayoutNode, UnsafeLayoutNode};

use gfx::display_list::OpaqueNode;
use servo_util::time::{ProfilerChan, profile};
use servo_util::time;
use servo_util::workqueue::{WorkQueue, WorkUnit, WorkerProxy};
use std::cast;
use std::ptr;
use std::sync::atomics::{AtomicInt, Relaxed, SeqCst};
use style::{Stylist, TNode};

#[allow(dead_code)]
fn static_assertion(node: UnsafeLayoutNode) {
    unsafe {
        let _: PaddedUnsafeFlow = ::std::intrinsics::transmute(node);
    }
}

/// Memory representation that is at least as large as UnsafeLayoutNode, as it must be
/// safely transmutable to and from that type to accommodate the type-unsafe parallel work
/// queue usage that stores both flows and nodes.
pub type PaddedUnsafeFlow = (uint, uint);

trait UnsafeFlowConversions {
    fn to_flow(&self) -> UnsafeFlow;
    fn from_flow(flow: &UnsafeFlow) -> Self;
}

impl UnsafeFlowConversions for PaddedUnsafeFlow {
    fn to_flow(&self) -> UnsafeFlow {
        let (vtable, ptr) = *self;
        (vtable, ptr)
    }

    fn from_flow(flow: &UnsafeFlow) -> PaddedUnsafeFlow {
        let &(vtable, ptr) = flow;
        (vtable, ptr)
    }
}

/// Vtable + pointer representation of a Flow trait object.
pub type UnsafeFlow = (uint, uint);

fn null_unsafe_flow() -> UnsafeFlow {
    (0, 0)
}

pub fn owned_flow_to_unsafe_flow(flow: *~Flow:Share) -> UnsafeFlow {
    unsafe {
        cast::transmute_copy(&*flow)
    }
}

pub fn mut_owned_flow_to_unsafe_flow(flow: *mut ~Flow:Share) -> UnsafeFlow {
    unsafe {
        cast::transmute_copy(&*flow)
    }
}

pub fn borrowed_flow_to_unsafe_flow(flow: &Flow) -> UnsafeFlow {
    unsafe {
        cast::transmute_copy(&flow)
    }
}

pub fn mut_borrowed_flow_to_unsafe_flow(flow: &mut Flow) -> UnsafeFlow {
    unsafe {
        cast::transmute_copy(&flow)
    }
}

/// Information that we need stored in each DOM node.
pub struct DomParallelInfo {
    /// The number of children that still need work done.
    pub children_count: AtomicInt,
}

impl DomParallelInfo {
    pub fn new() -> DomParallelInfo {
        DomParallelInfo {
            children_count: AtomicInt::new(0),
        }
    }
}

/// Information that we need stored in each flow.
pub struct FlowParallelInfo {
    /// The number of children that still need work done.
    pub children_count: AtomicInt,
    /// The number of children and absolute descendants that still need work done.
    pub children_and_absolute_descendant_count: AtomicInt,
    /// The address of the parent flow.
    pub parent: UnsafeFlow,
}

impl FlowParallelInfo {
    pub fn new() -> FlowParallelInfo {
        FlowParallelInfo {
            children_count: AtomicInt::new(0),
            children_and_absolute_descendant_count: AtomicInt::new(0),
            parent: null_unsafe_flow(),
        }
    }
}

/// A parallel bottom-up flow traversal.
trait ParallelPostorderFlowTraversal : PostorderFlowTraversal {
    /// Process current flow and potentially traverse its ancestors.
    ///
    /// If we are the last child that finished processing, recursively process
    /// our parent. Else, stop.
    /// Also, stop at the root (obviously :P).
    ///
    /// Thus, if we start with all the leaves of a tree, we end up traversing
    /// the whole tree bottom-up because each parent will be processed exactly
    /// once (by the last child that finishes processing).
    ///
    /// The only communication between siblings is that they both
    /// fetch-and-subtract the parent's children count.
    fn run_parallel(&mut self,
                    mut unsafe_flow: UnsafeFlow,
                    _: &mut WorkerProxy<*mut LayoutContext,PaddedUnsafeFlow>) {
        loop {
            unsafe {
                // Get a real flow.
                let flow: &mut ~Flow:Share = cast::transmute(&unsafe_flow);

                // Perform the appropriate traversal.
                if self.should_process(*flow) {
                    self.process(*flow);
                }

                let base = flow::mut_base(*flow);

                // Reset the count of children for the next layout traversal.
                base.parallel.children_count.store(base.children.len() as int, Relaxed);

                // Possibly enqueue the parent.
                let unsafe_parent = base.parallel.parent;
                if unsafe_parent == null_unsafe_flow() {
                    // We're done!
                    break
                }

                // No, we're not at the root yet. Then are we the last child
                // of our parent to finish processing? If so, we can continue
                // on with our parent; otherwise, we've gotta wait.
                let parent: &mut ~Flow:Share = cast::transmute(&unsafe_parent);
                let parent_base = flow::mut_base(*parent);
                if parent_base.parallel.children_count.fetch_sub(1, SeqCst) == 1 {
                    // We were the last child of our parent. Reflow our parent.
                    unsafe_flow = unsafe_parent
                } else {
                    // Stop.
                    break
                }
            }
        }
    }
}

/// A parallel top-down flow traversal.
trait ParallelPreorderFlowTraversal : PreorderFlowTraversal {
    fn run_parallel(&mut self,
                    unsafe_flow: UnsafeFlow,
                    proxy: &mut WorkerProxy<*mut LayoutContext,PaddedUnsafeFlow>);

    #[inline(always)]
    fn run_parallel_helper(&mut self,
                           unsafe_flow: UnsafeFlow,
                           proxy: &mut WorkerProxy<*mut LayoutContext,PaddedUnsafeFlow>,
                           top_down_func: extern "Rust" fn(PaddedUnsafeFlow,
                                                           &mut WorkerProxy<*mut LayoutContext,
                                                                            PaddedUnsafeFlow>),
                           bottom_up_func: extern "Rust" fn(PaddedUnsafeFlow,
                                                            &mut WorkerProxy<*mut LayoutContext,
                                                                             PaddedUnsafeFlow>)) {
        let mut had_children = false;
        unsafe {
            // Get a real flow.
            let flow: &mut ~Flow:Share = cast::transmute(&unsafe_flow);

            // Perform the appropriate traversal.
            self.process(*flow);

            // Possibly enqueue the children.
            for kid in flow::child_iter(*flow) {
                had_children = true;
                proxy.push(WorkUnit {
                    fun: top_down_func,
                    data: UnsafeFlowConversions::from_flow(&borrowed_flow_to_unsafe_flow(kid)),
                });
            }

        }

        // If there were no more children, start assigning heights.
        if !had_children {
            bottom_up_func(UnsafeFlowConversions::from_flow(&unsafe_flow), proxy)
        }
    }
}

impl<'a> ParallelPostorderFlowTraversal for BubbleWidthsTraversal<'a> {}

impl<'a> ParallelPreorderFlowTraversal for AssignWidthsTraversal<'a> {
    fn run_parallel(&mut self,
                    unsafe_flow: UnsafeFlow,
                    proxy: &mut WorkerProxy<*mut LayoutContext,PaddedUnsafeFlow>) {
        self.run_parallel_helper(unsafe_flow,
                                 proxy,
                                 assign_widths,
                                 assign_heights_and_store_overflow)
    }
}

impl<'a> ParallelPostorderFlowTraversal for AssignHeightsAndStoreOverflowTraversal<'a> {}

fn recalc_style_for_node(unsafe_layout_node: UnsafeLayoutNode,
                         proxy: &mut WorkerProxy<*mut LayoutContext,UnsafeLayoutNode>) {
    unsafe {
        let layout_context: &mut LayoutContext = cast::transmute(*proxy.user_data());

        // Get a real layout node.
        let node: LayoutNode = ::std::intrinsics::transmute(unsafe_layout_node);

        // Initialize layout data.
        //
        // FIXME(pcwalton): Stop allocating here. Ideally this should just be done by the HTML
        // parser.
        node.initialize_layout_data(layout_context.layout_chan.clone());

        // Get the parent node.
        let opaque_node: OpaqueNode = OpaqueNodeMethods::from_layout_node(&node);
        let parent_opt = if opaque_node == layout_context.reflow_root {
            None
        } else {
            node.parent_node()
        };

        // First, check to see whether we can share a style with someone.
        let style_sharing_candidate_cache = layout_context.style_sharing_candidate_cache();
        let sharing_result = node.share_style_if_possible(style_sharing_candidate_cache,
                                                          parent_opt.clone());

        // Otherwise, match and cascade selectors.
        match sharing_result {
            CannotShare(mut shareable) => {
                let mut applicable_declarations = ApplicableDeclarations::new();

                if node.is_element() {
                    // Perform the CSS selector matching.
                    let stylist: &Stylist = cast::transmute(layout_context.stylist);
                    node.match_node(stylist, &mut applicable_declarations, &mut shareable);
                }

                // Perform the CSS cascade.
                node.cascade_node(parent_opt,
                                  &*layout_context.initial_css_values,
                                  &applicable_declarations,
                                  layout_context.applicable_declarations_cache());

                // Add ourselves to the LRU cache.
                if shareable {
                    style_sharing_candidate_cache.insert_if_possible(&node);
                }
            }
            StyleWasShared(index) => style_sharing_candidate_cache.touch(index),
        }

        // Prepare for flow construction by counting the node's children and storing that count.
        let mut child_count = 0;
        for _ in node.children() {
            child_count += 1;
        }
        if child_count != 0 {
            let mut layout_data_ref = node.mutate_layout_data();
            match &mut *layout_data_ref {
                &Some(ref mut layout_data) => {
                    layout_data.data.parallel.children_count.store(child_count as int, Relaxed)
                }
                &None => fail!("no layout data"),
            }
        }

        // It's *very* important that this block is in a separate scope to the block above,
        // to avoid a data race that can occur (github issue #2308). The block above issues
        // a borrow on the node layout data. That borrow must be dropped before the child
        // nodes are actually pushed into the work queue. Otherwise, it's possible for a child
        // node to get into construct_flows() and move up it's parent hierarchy, which can call
        // borrow on the layout data before it is dropped from the block above.
        if child_count != 0 {
            // Enqueue kids.
            for kid in node.children() {
                proxy.push(WorkUnit {
                    fun: recalc_style_for_node,
                    data: layout_node_to_unsafe_layout_node(&kid),
                });
            }
            return
        }

        // If we got here, we're a leaf. Start construction of flows for this node.
        construct_flows(unsafe_layout_node, proxy)
    }
}

fn construct_flows(mut unsafe_layout_node: UnsafeLayoutNode,
                   proxy: &mut WorkerProxy<*mut LayoutContext,UnsafeLayoutNode>) {
    loop {
        let layout_context: &mut LayoutContext = unsafe {
            cast::transmute(*proxy.user_data())
        };

        // Get a real layout node.
        let node: LayoutNode = unsafe {
            cast::transmute(unsafe_layout_node)
        };

        // Construct flows for this node.
        {
            let mut flow_constructor = FlowConstructor::new(layout_context, None);
            flow_constructor.process(&ThreadSafeLayoutNode::new(&node));
        }

        // Reset the count of children for the next traversal.
        //
        // FIXME(pcwalton): Use children().len() when the implementation of that is efficient.
        let mut child_count = 0;
        for _ in node.children() {
            child_count += 1
        }
        {
            let mut layout_data_ref = node.mutate_layout_data();
            match &mut *layout_data_ref {
                &Some(ref mut layout_data) => {
                    layout_data.data.parallel.children_count.store(child_count as int, Relaxed)
                }
                &None => fail!("no layout data"),
            }
        }

        // If this is the reflow root, we're done.
        let opaque_node: OpaqueNode = OpaqueNodeMethods::from_layout_node(&node);
        if layout_context.reflow_root == opaque_node {
            break
        }

        // Otherwise, enqueue the parent.
        match node.parent_node() {
            Some(parent) => {

                // No, we're not at the root yet. Then are we the last sibling of our parent?
                // If so, we can continue on with our parent; otherwise, we've gotta wait.
                unsafe {
                    match *parent.borrow_layout_data_unchecked() {
                        Some(ref parent_layout_data) => {
                            let parent_layout_data = cast::transmute_mut(parent_layout_data);
                            if parent_layout_data.data
                                                 .parallel
                                                 .children_count
                                                 .fetch_sub(1, SeqCst) == 1 {
                                // We were the last child of our parent. Construct flows for our
                                // parent.
                                unsafe_layout_node = layout_node_to_unsafe_layout_node(&parent)
                            } else {
                                // Get out of here and find another node to work on.
                                break
                            }
                        }
                        None => fail!("no layout data for parent?!"),
                    }
                }
            }
            None => fail!("no parent and weren't at reflow root?!"),
        }
    }
}

fn assign_widths(unsafe_flow: PaddedUnsafeFlow,
                 proxy: &mut WorkerProxy<*mut LayoutContext,PaddedUnsafeFlow>) {
    let layout_context: &mut LayoutContext = unsafe {
        cast::transmute(*proxy.user_data())
    };
    let mut assign_widths_traversal = AssignWidthsTraversal {
        layout_context: layout_context,
    };
    assign_widths_traversal.run_parallel(unsafe_flow.to_flow(), proxy)
}

fn assign_heights_and_store_overflow(unsafe_flow: PaddedUnsafeFlow,
                                     proxy: &mut WorkerProxy<*mut LayoutContext,PaddedUnsafeFlow>) {
    let layout_context: &mut LayoutContext = unsafe {
        cast::transmute(*proxy.user_data())
    };
    let mut assign_heights_traversal = AssignHeightsAndStoreOverflowTraversal {
        layout_context: layout_context,
    };
    assign_heights_traversal.run_parallel(unsafe_flow.to_flow(), proxy)
}

fn compute_absolute_position(unsafe_flow: PaddedUnsafeFlow,
                             proxy: &mut WorkerProxy<*mut LayoutContext,PaddedUnsafeFlow>) {
    let mut had_descendants = false;
    unsafe {
        // Get a real flow.
        let flow: &mut ~Flow:Share = cast::transmute(&unsafe_flow);

        // Compute the absolute position for the flow.
        flow.compute_absolute_position();

        // Count the number of absolutely-positioned children, so that we can subtract it from
        // from `children_and_absolute_descendant_count` to get the number of real children.
        let mut absolutely_positioned_child_count = 0;
        for kid in flow::child_iter(*flow) {
            if kid.is_absolutely_positioned() {
                absolutely_positioned_child_count += 1;
            }
        }

        // Don't enqueue absolutely positioned children.
        drop(flow::mut_base(*flow).parallel
                                  .children_and_absolute_descendant_count
                                  .fetch_sub(absolutely_positioned_child_count as int, SeqCst));

        // Possibly enqueue the children.
        for kid in flow::child_iter(*flow) {
            if !kid.is_absolutely_positioned() {
                had_descendants = true;
                proxy.push(WorkUnit {
                    fun: compute_absolute_position,
                    data: UnsafeFlowConversions::from_flow(&borrowed_flow_to_unsafe_flow(kid)),
                });
            }
        }

        // Possibly enqueue absolute descendants.
        for absolute_descendant_link in flow::mut_base(*flow).abs_descendants.iter() {
            had_descendants = true;
            let descendant = absolute_descendant_link.resolve().unwrap();
            proxy.push(WorkUnit {
                fun: compute_absolute_position,
                data: UnsafeFlowConversions::from_flow(&borrowed_flow_to_unsafe_flow(descendant)),
            });
        }

        // If there were no more descendants, start building the display list.
        if !had_descendants {
            build_display_list(UnsafeFlowConversions::from_flow(
                               &mut_owned_flow_to_unsafe_flow(flow)),
                               proxy)
        }
    }
}

fn build_display_list(mut unsafe_flow: PaddedUnsafeFlow,
                      proxy: &mut WorkerProxy<*mut LayoutContext,PaddedUnsafeFlow>) {
    let layout_context: &mut LayoutContext = unsafe {
        cast::transmute(*proxy.user_data())
    };

    loop {
        unsafe {
            // Get a real flow.
            let flow: &mut ~Flow:Share = cast::transmute(&unsafe_flow);

            // Build display lists.
            flow.build_display_list(layout_context);

            {
                let base = flow::mut_base(*flow);

                // Reset the count of children and absolute descendants for the next layout
                // traversal.
                let children_and_absolute_descendant_count = base.children.len() +
                    base.abs_descendants.len();
                base.parallel
                    .children_and_absolute_descendant_count
                    .store(children_and_absolute_descendant_count as int, Relaxed);
            }

            // Possibly enqueue the parent.
            let unsafe_parent = if flow.is_absolutely_positioned() {
                mut_borrowed_flow_to_unsafe_flow(flow::mut_base(*flow).absolute_cb
                                                                      .resolve()
                                                                      .unwrap())
            } else {
                flow::mut_base(*flow).parallel.parent
            };
            if unsafe_parent == null_unsafe_flow() {
                // We're done!
                break
            }

            // No, we're not at the root yet. Then are we the last child
            // of our parent to finish processing? If so, we can continue
            // on with our parent; otherwise, we've gotta wait.
            let parent: &mut ~Flow:Share = cast::transmute(&unsafe_parent);
            let parent_base = flow::mut_base(*parent);
            if parent_base.parallel
                          .children_and_absolute_descendant_count
                          .fetch_sub(1, SeqCst) == 1 {
                // We were the last child of our parent. Build display lists for our parent.
                unsafe_flow = UnsafeFlowConversions::from_flow(&unsafe_parent)
            } else {
                // Stop.
                break
            }
        }
    }
}

pub fn recalc_style_for_subtree(root_node: &LayoutNode,
                                layout_context: &mut LayoutContext,
                                queue: &mut WorkQueue<*mut LayoutContext,UnsafeLayoutNode>) {
    unsafe {
        queue.data = cast::transmute(layout_context)
    }

    // Enqueue the root node.
    queue.push(WorkUnit {
        fun: recalc_style_for_node,
        data: layout_node_to_unsafe_layout_node(root_node),
    });

    queue.run();

    queue.data = ptr::mut_null()
}

pub fn traverse_flow_tree_preorder(root: &mut ~Flow:Share,
                                   profiler_chan: ProfilerChan,
                                   layout_context: &mut LayoutContext,
                                   queue: &mut WorkQueue<*mut LayoutContext,PaddedUnsafeFlow>) {
    unsafe {
        queue.data = cast::transmute(layout_context)
    }

    profile(time::LayoutParallelWarmupCategory, profiler_chan, || {
        queue.push(WorkUnit {
            fun: assign_widths,
            data: UnsafeFlowConversions::from_flow(&mut_owned_flow_to_unsafe_flow(root)),
        })
    });

    queue.run();

    queue.data = ptr::mut_null()
}

pub fn build_display_list_for_subtree(root: &mut ~Flow:Share,
                                      profiler_chan: ProfilerChan,
                                      layout_context: &mut LayoutContext,
                                      queue: &mut WorkQueue<*mut LayoutContext,PaddedUnsafeFlow>) {
    unsafe {
        queue.data = cast::transmute(layout_context)
    }

    profile(time::LayoutParallelWarmupCategory, profiler_chan, || {
        queue.push(WorkUnit {
            fun: compute_absolute_position,
            data: UnsafeFlowConversions::from_flow(&mut_owned_flow_to_unsafe_flow(root)),
        })
    });

    queue.run();

    queue.data = ptr::mut_null()
}

