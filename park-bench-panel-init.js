var hangout = new hangoutWrapper();
var renderer = renderer();
var pbp = parkBenchPanel(hangout, renderer);

$(document).ready(function() {
    pbp.start();
});

function startTalk() {
    pbp.gotSomethingToSay(hangout.getLocalParticipant());
}

function stopTalk() {
    pbp.doneTalkin(hangout.getLocalParticipant());
}