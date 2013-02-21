function hangoutWrapper() {

    var participants = [
    {
        id: 1,
        person: {
            displayName: 'Bob (1)',
        },
        status: 'listener'

    }, {
        id: 2,
        person: {
            displayName: 'Fred (2)',
        },
        status: 'listener'
    }, {
        id: 3,
        person: {
            displayName: 'Bill (3)',
        },
        status: 'listener'
    }, {
        id: 4,
        person: {
            displayName: 'Joe (4)',
        },
        status: 'listener'
    }, {
        id: 5,
        person: {
            displayName: 'Alf (5)',
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
            return (p.person.displayName == $('#localParticipantSelect').val() );
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
        $.each(participants, function(i, p){
            if ( delta[p.id] != undefined ) {
                p.status = delta[p.id];
            }
        });
        that.stateChangedCallBack(null);
    }

    this.displayNotice = function(message) {
        alert(message.message);
    }

    this.addTestParticipant = function() {
        var id = $('#participantId').val() * 1;
        var p = {
            id : id,
            person: {
                displayName : $('#displayName').val() + ' (' + id + ')',
            },
            status: 'listener'
        };
        participants.push(p);
        that.newParticipantCallBack({
            addedParticipants: [p]
        });
    }
    
    this.populateSelectList = function() {
        $.each(participants, function(i, p){
            $('#localParticipantSelect').append('<option>' + p.person.displayName + '</option>');
        });
       
    }
}