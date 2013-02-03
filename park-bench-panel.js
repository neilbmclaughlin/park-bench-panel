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
    setParticipantAsSpeaker(participant.id);
//    $('#listenerList li:contains("' + participant.person.displayName +'")').remove();
//    $('#speakerList').append($('<li/>').text(participant.person.displayName));
}

function stopTalk(participant) {
    setParticipantAsListener(participant.id);
//    $('#speakerList li:contains("' + participant.person.displayName +'")').remove();
//    $('#listenerList').append($('<li/>').text(participant.person.displayName));
}

function newParticipantJoined(participantAddedEvent) {
    $(participantAddedEvent.addedParticipants).each(function(index, Element) {
        $('#listenerList').append($('<li/>').text(Element.person.displayName));
    });
}

function stateChanged(stateChangedEvent) {
    showParticipants();
}

function init() {
    showParticipants();
    addOnNewParticipantCallback(newParticipantJoined);
    addOnStateChangedCallback(stateChanged);
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