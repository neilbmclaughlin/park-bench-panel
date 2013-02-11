function hangoutWrapper() {
    
    this.getParticipants = function() {
        var participants = gapi.hangout.getParticipants();
        var speakerIds = gapi.hangout.data.getKeys();

        $(participants).each(function(index, Element) {
            Element.isSpeaker = (jQuery.inArray(Element.id, speakerIds) >= 0);
        });

        return participants;
    }

    this.isHangoutApiReady = function() {
        return gapi.hangout.isApiReady();
    }

    this.addOnApiReadyCallback = function(f) {
        gapi.hangout.onApiReady.add(f);
    }

    this.getLocalParticipant = function() {
        return gapi.hangout.getLocalParticipant();
    }

    this.addOnNewParticipantCallback = function(f) {
        gapi.hangout.onParticipantsAdded.add(f);
    }

    this.addOnStateChangedCallback = function(f) {
        gapi.hangout.data.onStateChanged.add(f);
    }

    this.setParticipantAsSpeaker = function(delta) {
        return gapi.hangout.data.submitDelta(delta);
    }

    this.setParticipantAsListener = function(participantId) {
        return gapi.hangout.data.clearValue(participantId);
    }

}