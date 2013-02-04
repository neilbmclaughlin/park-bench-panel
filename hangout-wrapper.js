function getParticipants() {
    var participants = gapi.hangout.getParticipants(); 
    var speakerIds = gapi.hangout.data.getKeys();
    
    $(participants).each(function(index, Element) {
        Element.isSpeaker = ( jQuery.inArray(Element.id, speakerIds) >= 0 );
    });
    
    return participants;
}

function isHangoutApiReady() {
    return gapi.hangout.isApiReady();    
}

function addOnApiReadyCallback(f) {
    gapi.hangout.onApiReady.add(f);
}

function getLocalParticipant() {
    return gapi.hangout.getLocalParticipant();    
}

function addOnNewParticipantCallback(f) {
    gapi.hangout.onParticipantsAdded.add(f);   
}

function addOnStateChangedCallback(f) {
    gapi.hangout.data.onStateChanged.add(f);
}

function setParticipantAsSpeaker(participantId) {
    var delta = {};
    delta[participantId] = 'speaker';
    return gapi.hangout.data.submitDelta( delta );
}

function setParticipantAsListener(participantId) {
    return gapi.hangout.data.clearValue( participantId );
}