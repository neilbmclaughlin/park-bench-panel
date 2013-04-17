var hangout = hangoutWrapper(gapi);
var renderer = testingCanvasRenderer();
var pbp = parkBenchPanel(hangout, renderer);
var listeningGroup, speakingGroup, canvas;

$(document).ready(function() {

    canvas = new fabric.Canvas('myCanvas');

    // create a rectangle object

    listeningGroup = new fabric.Group([], {
        left: 0,
        top: 0,
        width: 400,
        height: 400,
    });

    speakingGroup = new fabric.Group([], {
        left: 450,
        top: 0,
        width: 400,
        height: 400,
    });

    canvas.add(listeningGroup, speakingGroup);

    pbp.start();
});

function startTalk() {
    var localParticipantName = hangout.getLocalParticipant().getName();
    pbp.gotSomethingToSay(localParticipantName);
}

function stopTalk() {
    var localParticipantName = hangout.getLocalParticipant().getName();
    pbp.doneTalkin(localParticipantName);
}