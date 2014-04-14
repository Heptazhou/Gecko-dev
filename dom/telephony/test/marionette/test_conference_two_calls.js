/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

MARIONETTE_TIMEOUT = 60000;
MARIONETTE_HEAD_JS = 'head.js';

function testConferenceTwoCalls() {
  log('= testConferenceTwoCalls =');

  let outCall;
  let inCall;
  let outNumber = "5555550101";
  let inNumber  = "5555550201";

  return Promise.resolve()
    .then(() => gSetupConferenceTwoCalls(outNumber, inNumber))
    .then(calls => {
      [outCall, inCall] = calls;
    })
    .then(() => gRemoteHangUpCalls([outCall, inCall]));
}

// Start the test
startTest(function() {
  testConferenceTwoCalls()
    .then(null, error => {
      ok(false, 'promise rejects during test.');
    })
    .then(finish);
});
