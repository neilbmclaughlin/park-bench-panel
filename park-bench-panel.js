function showParticipants() {
    var participants = getParticipants();

    buildParticipantList(participants)

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
    var items = [];

    $(participants).each(function(index, Element) {
        items.push($('<li/>').text(Element.person.displayName));
    });
    $('#participantList').append.apply($('#participantList'), items);

}



//
//function getLocalParticipantName() {
//    return gapi.hangout.getLocalParticipant().person.displayName;    
//}
//
//function startTalk() {
//    var speaker = getLocalParticipantName();
//    $('#speakerList').append.apply($('#speakerList'), speaker);
//    alert(speaker);
//}
//
//function stopTalk() {
//    var speaker = getLocalParticipantName();
//    $('#participantList').append.apply($('#participantList'), speaker);
//    alert(speaker);
//}
//
//
$(document).ready(function() {
   if(isHangoutApiReady()){ 
        console.log("Yes it was ready. We can start."); 
        showParticipants();
    } else { 
        console.log("No - not read yet. We have to listen."); 
        addOnApiReadyCallback(showParticipants);
    }
});