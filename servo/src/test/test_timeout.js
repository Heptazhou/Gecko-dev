function foo(i) {
  window.alert("timeout " + i);
  if (i == 10)
    window.alert("timeouts finished");
  else
    window.setTimeout(function() { foo(i + 1); }, 1000);
}

window.alert("beginning timeouts");
window.setTimeout(function() { foo(0); }, 1000);
window.alert("timeouts begun");