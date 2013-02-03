function getParticipants() {
    var participants = gapi.hangout.getParticipants(); 
    var speakerIds = getStateValue('speakerIds');
    
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
    return gapi.hangout.onParticipantsAdded.add(f);   
}

function getStateValue(key) {
    gapi.hangout.data.getValue(key);
}

function setStateValue(key, value) {
    gapi.hangout.data.setValue(key, value);
}
