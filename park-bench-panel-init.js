var hangout = new hangoutWrapper();    
var pbp = new parkBenchPanel(hangout);

$(document).ready(function() {
    pbp.init();
});

function startTalk() {
    pbp.startTalk(hangout.getLocalParticipant());
}

function stopTalk() {
    pbp.stopTalk(hangout.getLocalParticipant());
}