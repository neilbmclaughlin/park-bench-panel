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
    };

    this.buildParticipantLists = function(participants) {
        $("#speakerList").empty();
        $("#waitingList").empty();
        $("#listenerList").empty();
        $(participants).each(function(index, Element) {
            var listName = '#' + Element.statusHistory[Element.statusHistory.length-1] + 'List';
            $(listName)
            .append($('<li/>')
            .text(Element.person.displayName));
            //.animate({ opacity: 'toggle'}, 5000, 'linear');
        });
    };
    
    this.getParticipantCounts = function() {

        var participants = hangout.getParticipants();
        var counts = { speaker : 0, waiting : 0, listener : 0 };
        
        $(participants).each(
            function(index, Element) {
                counts[Element.statusHistory[Element.statusHistory.length-1]]++;
            } 
        );
        
        return counts;
    };

    this.startTalk = function(participant) {
        var newStatus = ( that.getParticipantCounts().speaker < 3 ? 'speaker' : 'waiting' );
        var message = "";
        if(newStatus === 'waiting') {
            //show display message
            message = 'is waiting to speak';
        }else{
            //you are the speaker
            message = 'is about to speak';
        }
        
        var delta = {};
        participant.statusHistory.push(newStatus);
        delta[participant.id] = participant.statusHistory;
        hangout.setParticipantStatus(delta);
        hangout.displayNotice( { 
            message : participant.person.displayName + " " + message,
            opt_permanent : false
        } );
    };

    this.stopTalk = function(participant) {
        var delta = {};
        participant.statusHistory.push('listener');        
        delta[participant.id] = participant.statusHistory;

        //Move a waiting participant to the speaker queue
        //Is this a fifo queue - need test
        var participants = hangout.getParticipants();
        var waitingParticipants = $.grep(participants, function (p) { return p.statusHistory[p.statusHistory.length - 1] == 'waiting'; });
        
        if ( waitingParticipants.length > 0 ) {
            waitingParticipants[0].statusHistory.push('speaker');
            delta[waitingParticipants[0].id] =  waitingParticipants[0].statusHistory;
        }
        hangout.setParticipantStatus(delta);
    };

    this.newParticipantJoined = function(participantAddedEvent) {
        $(participantAddedEvent.addedParticipants).each(function(index, Element) {
            $('#listenerList').append($('<li/>').text(Element.person.displayName));
        });
    };

    this.stateChanged = function(stateChangedEvent) {
        that.showParticipants();
    };
    
    this.setup = function() {
        that.showParticipants();
        hangout.addOnNewParticipantCallback(that.newParticipantJoined);
        hangout.addOnStateChangedCallback(that.stateChanged);
    };
    
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
    };
    
};