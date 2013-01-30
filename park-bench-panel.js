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

$(document).ready(function() {
   if(gapi.hangout.isApiReady()){ 
        console.log("Yes it was ready. We can start."); 
        showParticipants();
    } else { 
        console.log("No - not read yet. We have to listen."); 
        gapi.hangout.onApiReady.add(showParticipants;
    }
});