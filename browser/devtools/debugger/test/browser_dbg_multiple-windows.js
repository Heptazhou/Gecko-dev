/* Any copyright is dedicated to the Public Domain.
   http://creativecommons.org/publicdomain/zero/1.0/ */

/**
 * Make sure that the debugger attaches to the right tab when multiple windows
 * are open.
 */

const TAB1_URL = EXAMPLE_URL + "doc_script-switching-01.html";
const TAB2_URL = EXAMPLE_URL + "doc_script-switching-02.html";

let gNewTab, gNewWindow;
let gClient;

function test() {
  if (!DebuggerServer.initialized) {
    DebuggerServer.init(() => true);
    DebuggerServer.addBrowserActors();
  }

  let transport = DebuggerServer.connectPipe();
  gClient = new DebuggerClient(transport);
  gClient.connect((aType, aTraits) => {
    is(aType, "browser",
      "Root actor should identify itself as a browser.");

    promise.resolve(null)
      .then(() => addTab(TAB1_URL))
      .then(testFirstTab)
      .then(() => addWindow(TAB2_URL))
      .then(testNewWindow)
      .then(testFocusFirst)
      .then(testRemoveTab)
      .then(closeConnection)
      .then(finish)
      .then(null, aError => {
        ok(false, "Got an error: " + aError.message + "\n" + aError.stack);
      });
  });
}

function testFirstTab(aTab) {
  let deferred = promise.defer();

  gNewTab = aTab;
  ok(!!gNewTab, "Second tab created.");

  gClient.listTabs(aResponse => {
    let tabActor = aResponse.tabs.filter(aGrip => aGrip.url == TAB1_URL).pop();
    ok(tabActor,
      "Should find a tab actor for the first tab.");

    is(aResponse.selected, 1,
      "The first tab is selected.");

    deferred.resolve();
  });

  return deferred.promise;
}

function testNewWindow(aWindow) {
  let deferred = promise.defer();

  gNewWindow = aWindow;
  ok(!!gNewWindow, "Second window created.");

  gNewWindow.focus();

  let topWindow = Services.wm.getMostRecentWindow("navigator:browser");
  is(topWindow, gNewWindow,
    "The second window is on top.");

  let isActive = promise.defer();
  let isLoaded = promise.defer();

  promise.all([isActive.promise, isLoaded.promise]).then(() => {
    gNewWindow.BrowserChromeTest.runWhenReady(() => {
      gClient.listTabs(aResponse => {
        is(aResponse.selected, 2,
          "The second tab is selected.");

        deferred.resolve();
      });
    });
  });

  let focusManager = Cc["@mozilla.org/focus-manager;1"].getService(Ci.nsIFocusManager);
  if (focusManager.activeWindow != gNewWindow) {
    gNewWindow.addEventListener("activate", function onActivate(aEvent) {
      if (aEvent.target != gNewWindow) {
        return;
      }
      gNewWindow.removeEventListener("activate", onActivate, true);
      isActive.resolve();
    }, true);
  } else {
    isActive.resolve();
  }

  let contentLocation = gNewWindow.content.location.href;
  if (contentLocation != TAB2_URL) {
    gNewWindow.document.addEventListener("load", function onLoad(aEvent) {
      if (aEvent.target.documentURI != TAB2_URL) {
        return;
      }
      gNewWindow.document.removeEventListener("load", onLoad, true);
      isLoaded.resolve();
    }, true);
  } else {
    isLoaded.resolve();
  }

  return deferred.promise;
}

function testFocusFirst() {
  let deferred = promise.defer();

  once(window.content, "focus").then(() => {
    let topWindow = Services.wm.getMostRecentWindow("navigator:browser");
    is(top, getDOMWindow(window),
      "The first window is on top.");

    gClient.listTabs(aResponse => {
      is(aResponse.selected, 1,
        "The first tab is selected after focusing on it.");

      deferred.resolve();
    });
  });

  window.content.focus();

  return deferred.promise;
}

function testRemoveTab() {
  gNewWindow.close();
  removeTab(gNewTab);

  gClient.listTabs(aResponse => {
    // Verify that tabs are no longer included in listTabs.
    let foundTab1 = aResponse.tabs.some(aGrip => aGrip.url == TAB1_URL);
    let foundTab2 = aResponse.tabs.some(aGrip => aGrip.url == TAB2_URL);
    ok(!foundTab1, "Tab1 should be gone.");
    ok(!foundTab2, "Tab2 should be gone.");

    is(aResponse.selected, 0,
      "The original tab is selected.");
  });
}

function closeConnection() {
  let deferred = promise.defer();
  gClient.close(deferred.resolve);
  return deferred.promise;
}

registerCleanupFunction(function() {
  gNewTab = null;
  gNewWindow = null;
  gClient = null;
});
