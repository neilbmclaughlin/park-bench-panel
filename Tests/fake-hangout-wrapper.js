function hangoutWrapper() {

    var participants = [{
        id: 1,
        person: {
            displayName: 'Bob',
        },
        status: 'listener'

    }, {
        id: 2,
        person: {
            displayName: 'Fred',
        },
        status: 'listener'
    }, {
        id: 3,
        person: {
            displayName: 'Bill',
        },
        status: 'listener'
    }];

    var that = this;
    var newParticipantCallBack = null;
    var stateChangedCallBack = null;

    this.getParticipants = function() {

        return participants;

    }

    this.isHangoutApiReady = function() {
        return true;
    }

    this.addOnApiReadyCallback = function(f) {}

    this.getLocalParticipant = function() {
        return jQuery.grep(participants, function(p){
            return (p.person.displayName == $('#localParticipant').val() );
        })[0];
    }

    this.addOnNewParticipantCallback = function(f) {
        this.newParticipantCallBack = f
    }

    this.addOnStateChangedCallback = function(f) {
        this.stateChangedCallBack = f        
    }
    
    this.clearParticipantStatus = function(participantId) {}

    this.setParticipantStatus = function(delta) {
        jQuery.each(participants, function(i, p){
            if ( delta[p.id] != undefined ) {
                p.status = 'speaker'
            }
        });
        that.stateChangedCallBack(null);
    }

    this.displayNotice = function(message) {
        alert(message.message);
    }

    this.addTestParticipant = function() {
        var p = {
            id : $('#participantId').val() * 1,
            person: {
                displayName : $('#displayName').val(),
            },
            status: 'listener'
        };
        participants.push(p);
        that.newParticipantCallBack({
            addedParticipants: [p]
        });
    }
}