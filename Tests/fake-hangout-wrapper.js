function hangoutWrapper() {

    var p1 = { 
            person : { 
                displayName : 'Bob',
            },
            status : 'listener'

        }; 
    var p2 = { 
                person : { 
                    displayName : 'Fred',
                },
                status : 'listener'
            };
    var p3 = { 
                person : { 
                    displayName : 'Bill',
                },
                status : 'listener'
            };

    this.getParticipants = function() {

        return [p1, p2, p3];

    }

    this.isHangoutApiReady = function() { return true; }

    this.addOnApiReadyCallback = function(f) {
    }

    this.getLocalParticipant = function() {
        return { 
                person : { 
                    displayName : 'Bob',
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
    
    this.displayNotice = function(message) { 
        alert(message.message);
    }

}