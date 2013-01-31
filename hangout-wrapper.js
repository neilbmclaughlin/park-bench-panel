function getParticipants() {
    return gapi.hangout.getParticipants();    
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
