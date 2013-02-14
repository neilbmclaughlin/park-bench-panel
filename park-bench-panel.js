var parkBenchPanel = function(hangout) {
    //Notes:
    //1: consider self invocation pattern to limit scope
    //2: can use gapi.hangout.onApiReady.add(this.onApiReady.bind(this)); to bind to current object and keep this in context
    //3: person is only available on participants who are running the app
    //4: gapi.hangout.getEnabledParticipants() returns array of only those participants who are actually running the app.

    var that = this;
    
    this.showParticipants = function() {
        var participants = hangout.getParticipants();
        that.buildParticipantLists(participants);
    }

    this.buildParticipantLists = function(participants) {
        $("#speakerList").empty();
        $("#listenerList").empty();
        $(participants).each(function(index, Element) {
            var listName = (Element.isSpeaker ? '#speakerList' : '#listenerList');
            $(listName).append($('<li/>').text(Element.person.displayName));
        });
    }

    this.startTalk = function(participant) {
        var delta = {};
        delta[participant.id] = 'speaker';
        hangout.setParticipantAsSpeaker(delta);
        $('#errorMessage').show();
    }

    this.stopTalk = function(participant) {
        hangout.setParticipantAsListener(participant.id);
    }

    this.newParticipantJoined = function(participantAddedEvent) {
        $(participantAddedEvent.addedParticipants).each(function(index, Element) {
            $('#listenerList').append($('<li/>').text(Element.person.displayName));
        });
    }

    this.stateChanged = function(stateChangedEvent) {
        that.showParticipants();
    }
    
    this.setup = function() {
        that.showParticipants();
        hangout.addOnNewParticipantCallback(that.newParticipantJoined);
        hangout.addOnStateChangedCallback(that.stateChanged);
    }
    
    this.init = function() {
        console.log("init");    
        if (hangout.isHangoutApiReady()) {
            console.log("Yes it was ready. We can start.");
            that.setup();
        }
        else {
            console.log("No - not read yet. We have to listen.");
            hangout.addOnApiReadyCallback(that.setup);
        }
    }
    
};