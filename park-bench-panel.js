function showParticipants() {
    var participants = getParticipants();
    buildParticipantLists(participants);
}

function buildParticipantLists(participants) {
    $(participants).each(function(index, Element) {
        var listName = (Element.isSpeaker ? '#speakerList' : '#listenerList');
        $(listName).append($('<li/>').text(Element.person.displayName));
    });
}

function startTalk(participant) {
    $('#listenerList li:contains("' + participant.person.displayName +'")').remove();
    $('#speakerList').append($('<li/>').text(participant.person.displayName));
}

function stopTalk(participant) {
    $('#speakerList li:contains("' + participant.person.displayName +'")').remove();
    $('#listenerList').append($('<li/>').text(participant.person.displayName));
}

function newParticipantJoined(participantAddedEvent) {
    $(participantAddedEvent.addedParticipants).each(function(index, Element) {
        $('#listenerList').append($('<li/>').text(Element.person.displayName));
    });
}

function init() {
    showParticipants();
    addOnNewParticipantCallback(newParticipantJoined);
}

$(document).ready(function() {
   if(isHangoutApiReady()){ 
        console.log("Yes it was ready. We can start."); 
        init();
    } else { 
        console.log("No - not read yet. We have to listen."); 
        addOnApiReadyCallback(init);
    }
});