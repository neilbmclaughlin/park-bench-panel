function hangoutWrapper() {

    var participants = [{
        person: {
            displayName: 'Bob',
        },
        status: 'listener'

    }, {
        person: {
            displayName: 'Fred',
        },
        status: 'listener'
    }, {
        person: {
            displayName: 'Bill',
        },
        status: 'listener'
    }];



    var that = this;
    var newParticipantCallBack = null;

    this.getParticipants = function() {

        return participants;

    }

    this.isHangoutApiReady = function() {
        return true;
    }

    this.addOnApiReadyCallback = function(f) {}

    this.getLocalParticipant = function() {
        return participants[0];
    }

    this.addOnNewParticipantCallback = function(f) {
        this.newParticipantCallBack = f
    }

    this.addOnStateChangedCallback = function(f) {}

    this.setParticipantAsSpeaker = function(participantId) {}

    this.setParticipantAsListener = function(participantId) {}

    this.displayNotice = function(message) {
        alert(message.message);
    }

    this.addTestParticipant = function() {
        var p = {
            person: {
                displayName: $('#displayname').val(),
            },
            status: 'listener'
        };
        participants.push(p);
        that.newParticipantCallBack({
            addedParticipants: [p]
        });
    }
}