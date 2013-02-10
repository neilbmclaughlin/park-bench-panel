var parkBenchPanel = function(hangout) {
    //Notes:
    //1: consider self invocation pattern to limit scope
    //2: can use gapi.hangout.onApiReady.add(this.onApiReady.bind(this)); to bind to current object and keep this in context
    //3: person is only available on participants who are running the app
    //4: gapi.hangout.getEnabledParticipants() returns array of only those participants who are actually running the app.

    this.showParticipants = function() {
        var participants = getParticipants();
        buildParticipantLists(participants);
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
        //    $('#listenerList li:contains("' + participant.person.displayName +'")').remove();
        //    $('#speakerList').append($('<li/>').text(participant.person.displayName));

    }

    thisstopTalk = function(participant) {
        hangout.setParticipantAsListener(participant.id);
        //    $('#speakerList li:contains("' + participant.person.displayName +'")').remove();
        //    $('#listenerList').append($('<li/>').text(participant.person.displayName));
    }

    this.newParticipantJoined = function(participantAddedEvent) {
        $(participantAddedEvent.addedParticipants).each(function(index, Element) {
            $('#listenerList').append($('<li/>').text(Element.person.displayName));
        });
    }

    this.stateChanged = function(stateChangedEvent) {
        showParticipants();
    }

    this.init = function() {
        showParticipants();
        hangout.addOnNewParticipantCallback(newParticipantJoined);
        hangout.addOnStateChangedCallback(stateChanged);
    }
};