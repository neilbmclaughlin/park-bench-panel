function showParticipants() {
    var participants = getParticipants();

    buildParticipantList(participants);

//    $("#participantList li").draggable({
//        appendTo: "body",
//        helper: "clone"
//    });
//
//    $("#speakerList").droppable({
//        activeClass: "ui-state-default",
//        hoverClass: "ui-state-hover",
//        drop: function(event, ui) {
//            $(this).find(".speakerPlaceholder").remove();
//            $("<li></li>").text(ui.draggable.text()).appendTo(this);
//        }
//    });
}

function buildParticipantList(participants) {
    $(participants).each(function(index, Element) {
        //$('#participantList').append($('<li/>').text(Element.person.displayName));
    });
}

function startTalk(participant) {
    //var speaker = getLocalParticipant();
    $('#participantList li:contains("' + participant.person.displayName +'")').remove();
    $('#speakerList').append($('<li/>').text(participant.person.displayName));
}

function stopTalk(participant) {
    //var speaker = getLocalParticipant();
    $('#speakerList li:contains("' + participant.person.displayName +'")').remove();
    $('#participantList').append($('<li/>').text(participant.person.displayName));
}


$(document).ready(function() {
   if(isHangoutApiReady()){ 
        console.log("Yes it was ready. We can start."); 
        showParticipants();
    } else { 
        console.log("No - not read yet. We have to listen."); 
        addOnApiReadyCallback(showParticipants);
    }
});