/* This file exists just to make it easier to import platform-specific
  implementations.
 
Note that you still must define each of the files as a module in
servo.rc. This is not ideal and may be changed in the future. */

pub use font_handle::FontHandle;
pub use font_context::FontContext;