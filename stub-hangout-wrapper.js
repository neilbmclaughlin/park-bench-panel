function stubHangoutWrapper() {

    this.getParticipants = function() {
    }

    this.isHangoutApiReady = function() { return true; }

    this.addOnApiReadyCallback = function(f) {
    }

    this.getLocalParticipant = function() {
        return { 
                person : { 
                    displayName : 'Bob',
                    age : 21
                } 
            };
    }

    this.addOnNewParticipantCallback = function(f) {
    }

    this.addOnStateChangedCallback = function(f) {
    }

    this.setParticipantAsSpeaker = function(participantId) {
    }

    this.setParticipantAsListener = function(participantId) {
    }

}