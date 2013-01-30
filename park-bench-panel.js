function showParticipants() {
    var items = [];
    var participants = getParticipants();

    $(participants).each(function(index, Element) {
        items.push($('<li/>').text(Element.person.displayName));
    });
    $('#participantList').append.apply($('#participantList'), items);

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

function getParticipants() {
    return gapi.hangout.getParticipants();
    
}

function startTalk() {
    var speaker = getLocalParticipant().person.displayName;
    $('#speakerList').append.apply($('#speakerList'), speaker);
    alert(speaker);
}

function stopTalk() {
    var speaker = getLocalParticipant().person.displayName;
    $('#participantList').append.apply($('#participantList'), speaker);
    alert(speaker);
}


$(document).ready(function() {
   if(gapi.hangout.isApiReady()){ 
        console.log("Yes it was ready. We can start."); 
        showParticipants();
    } else { 
        console.log("No - not read yet. We have to listen."); 
        gapi.hangout.onApiReady.add(showParticipants);
    }
});