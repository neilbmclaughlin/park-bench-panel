if(!Array.prototype.last) {
    Array.prototype.last = function() {
        return this[this.length - 1];
    };
}
if(!Array.prototype.first) {
    Array.prototype.first = function() {
        return this[0];
    };
}


var participantService = function(hangout, renderer) {

    this.participantMapper = function(p ,i) {
        return {
            id : p.person.id,
            displayName : p.person.displayName,
            },
            setStatus : function(status) {
                renderer.move(status);
                hangout.saveStatus(p, status);
                var message = ( status === 'waiting' ? 'is waiting to speak' : 'is about to speak' );
                hangout.displayNotice(p.displayName + " " + message);
            getStatus : function() {
                return hangout.getStatus(p.id);
            },
            display : function() {
                renderer.add();
            }
        };
    };
        
    this.getParticipants = function(renderer) {
        var gParticipants = hangout.getParticipants();
        return $(gParticipants).map(this.participantMapper());
    };

    this.getParticipantCounts = function() {

        var participants = hangout.getParticipants();
        var counts = { speaker : 0, waiting : 0, listener : 0 };
        
        $(participants).each(
            function(i, p) {
                counts[p.status]++;
            } 
        );
        
        return counts;
    };
    
}

var parkBenchPanel = function(participantService) {

    //Notes:
    //1: consider self invocation pattern to limit scope
    //2: can use gapi.hangout.onApiReady.add(this.onApiReady.bind(this)); to bind to current object and keep this in context
    //3: person is only available on participants who are running the app
    //4: gapi.hangout.getEnabledParticipants() returns array of only those participants who are actually running the app.

    var that = this;
    
    this.showParticipants = function() {
        var participants = participantService.getParticipants();
        $(participants).each(function(i, p) {
            p.display();
        }
    };


    this.buildParticipantLists = function(participants) {
        //find participant in list
        //if participant in a list different from current state
        //fade out and remove entry from old list
        //fade in and add entry to new list
        $("#speakerList").empty();
        $("#waitingList").empty();
        $("#listenerList").empty();
        $(participants).each(function(index, Element) {
            var listName = '#' + Element.statusHistory.last() + 'List';
            $(listName)
            .append($('<li/>')
            .text(Element.person.displayName));
            //.animate({ opacity: 'toggle'}, 5000, 'linear');
        });
    };
    

    this.startTalk = function(participant) {
        var newStatus = ( participantService.getParticipantCounts().speaker < 3 ? 'speaker' : 'waiting' );

        participant.setStatus(newStatus);

    };

    this.stopTalk = function(participant) {
        var delta = {};
        participant.statusHistory.push('listener');        
        delta[participant.id] = participant.statusHistory;

        //Move a waiting participant to the speaker queue
        //Is this a fifo queue - need test
        var participants = hangout.getParticipants();
        var waitingParticipants = $.grep(participants, function (p) { 
            return p.statusHistory.last() == 'waiting'; 
        });
        
        if ( waitingParticipants.length > 0 ) {
            waitingParticipants[0].statusHistory.push('speaker');
            delta[waitingParticipants.first().id] =  waitingParticipants.first().statusHistory;
        }
        hangout.setParticipantStatus(delta);
        hangout.displayNotice(participant.person.displayName + " has finished speaking");
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