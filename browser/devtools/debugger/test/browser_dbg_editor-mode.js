/* Any copyright is dedicated to the Public Domain.
   http://creativecommons.org/publicdomain/zero/1.0/ */

/**
 * Make sure that updating the editor mode sets the right highlighting engine,
 * and source URIs with extra query parameters also get the right engine.
 */

const TAB_URL = EXAMPLE_URL + "doc_editor-mode.html";

let gTab, gDebuggee, gPanel, gDebugger;
let gEditor, gSources;

function test() {
  initDebugger(TAB_URL).then(([aTab, aDebuggee, aPanel]) => {
    gTab = aTab;
    gDebuggee = aDebuggee;
    gPanel = aPanel;
    gDebugger = gPanel.panelWin;
    gEditor = gDebugger.DebuggerView.editor;
    gSources = gDebugger.DebuggerView.Sources;

    waitForSourceAndCaretAndScopes(gPanel, "code_test-editor-mode", 5)
      .then(testInitialSource)
      .then(testSwitch1)
      .then(testSwitch2)
      .then(() => resumeDebuggerThenCloseAndFinish(gPanel))
      .then(null, aError => {
        ok(false, "Got an error: " + aError.message + "\n" + aError.stack);
      });

    gDebuggee.firstCall();
  });
}

function testInitialSource() {
  is(gSources.itemCount, 3,
    "Found the expected number of sources.");

  is(gEditor.getMode(), SourceEditor.MODES.TEXT,
    "Found the expected editor mode.");
  is(gEditor.getText().search(/firstCall/), -1,
    "The first source is not displayed.");
  is(gEditor.getText().search(/debugger/), 141,
    "The second source is displayed.");
  is(gEditor.getText().search(/banana/), -1,
    "The third source is not displayed.");

  let finished = waitForDebuggerEvents(gPanel, gDebugger.EVENTS.SOURCE_SHOWN);
  gSources.selectedLabel = "code_script-switching-01.js";
  return finished;
}

function testSwitch1() {
  is(gSources.itemCount, 3,
    "Found the expected number of sources.");

  is(gEditor.getMode(), SourceEditor.MODES.JAVASCRIPT,
    "Found the expected editor mode.");
  is(gEditor.getText().search(/firstCall/), 118,
    "The first source is displayed.");
  is(gEditor.getText().search(/debugger/), -1,
    "The second source is not displayed.");
  is(gEditor.getText().search(/banana/), -1,
    "The third source is not displayed.");

  let finished = waitForDebuggerEvents(gPanel, gDebugger.EVENTS.SOURCE_SHOWN);
  gSources.selectedLabel = "doc_editor-mode.html";
  return finished;
}

function testSwitch2() {
  is(gSources.itemCount, 3,
    "Found the expected number of sources.");

  is(gEditor.getMode(), SourceEditor.MODES.HTML,
    "Found the expected editor mode.");
  is(gEditor.getText().search(/firstCall/), -1,
    "The first source is not displayed.");
  is(gEditor.getText().search(/debugger/), -1,
    "The second source is not displayed.");
  is(gEditor.getText().search(/banana/), 443,
    "The third source is displayed.");
}

registerCleanupFunction(function() {
  gTab = null;
  gDebuggee = null;
  gPanel = null;
  gDebugger = null;
  gEditor = null;
  gSources = null;
});
