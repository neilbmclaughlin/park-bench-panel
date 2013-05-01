

if (typeof Object.create !== 'function') {
    Object.create = function(o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
}

Function.prototype.method = function(name, func) {
    this.prototype[name] = func;
    return this;
};

// Object.method('superior', function (name) {
//     //var that = this, method = that[name];
//     return function () {
//         return null; //method.apply(that, arguments);
//     };
// });

if (!Array.prototype.last) {
    Array.prototype.last = function() {
        return this[this.length - 1];
    };
}

if (!Array.prototype.first) {
    Array.prototype.first = function() {
        return this[0];
    };
}




var participant = function(spec) {

    var that = {};
    var statusChangedEventHandlers = [];
    
    if (spec.statusChangedEventHandlers !== undefined) {
        statusChangedEventHandlers.push.apply(statusChangedEventHandlers, spec.statusChangedEventHandlers);
    }
    
    that.getId = function() {
        return spec.id;
    };

    that.getName = function() {
        return spec.name;
    };

    that.getStatus = function() {
        return spec.status;
    };

    that.isLocal = function() {
        return spec.local;
    };

    that.setStatus = function(status) {
        
        if (spec.status != status) {
            var lastStatus = spec.status;
            spec.status = status;
            $.each(statusChangedEventHandlers, function(i, h) {
                h({
                    participant : that,
                    lastStatus: lastStatus
                });
            });
        }
    };

    that.addOnStatusChangedHandlers = function(handlers) {
        $.each(handlers, function(i, h) {
            statusChangedEventHandlers.push(h);
        });
    };

    return that;
};

var participantMapper = function(hangoutWrapper, localParticipantId) {

    return function(googleParticipant) {
        
        var repositoryUpdatehandler = function(updateDetails) {
            hangoutWrapper.setStatus(updateDetails.participant.getId(), updateDetails.participant.getStatus());
        };

        return participant({
            id: googleParticipant.person.id,
            name: googleParticipant.person.displayName,
            status: hangoutWrapper.getStatus(googleParticipant.person.id),
            local: googleParticipant.person.id == localParticipantId,
            statusChangedEventHandlers: [ repositoryUpdatehandler ],
        });
    };
};

var hangoutWrapper = function(gapi) {

    var that = {};
    var localParticipantId = gapi.hangout.getLocalParticipant().person.id;
    var mapper = participantMapper(that, localParticipantId);

    var getWrappedHandler = function(f, mapper, propertyName) {
        return function(participantEvent) {
            var pbpParticipants = $.map(participantEvent[propertyName], mapper);
            f(pbpParticipants);
        };
    };

    var getWrappedRemovedHandler = function(f, mapper) {
        return function(newParticipantEvent) {
            var pbpParticipants = $.map(newParticipantEvent.removedParticipants, mapper);
            f(pbpParticipants);
        };
    };

    var setup = function(participantsJoinedHandler, participantsLeftHandler, statusChangedHandler, init) {
        gapi.hangout.onParticipantsAdded.add(getWrappedHandler(participantsJoinedHandler, mapper, 'addedParticipants'));
        gapi.hangout.onParticipantsRemoved.add(getWrappedHandler(participantsLeftHandler, mapper, 'removedParticipants'));
        gapi.hangout.data.onStateChanged.add(statusChangedHandler);
        init();
    };

    that.start = function(participantsAddedHandler, participantsLeftHandler, statusChangedHandler, init) {
        if (gapi.hangout.isApiReady()) {
            setup(participantsAddedHandler, participantsLeftHandler, statusChangedHandler, init);
        }
        else {
            var f = function() {
                setup(participantsAddedHandler, participantsLeftHandler, statusChangedHandler, init);
            };
            gapi.hangout.onApiReady.add(f);
        }
    };
    that.getParticipants = function(statusChangedEventHandlers) {
        return $.map(gapi.hangout.getParticipants(), mapper);
    };
    that.getLocalParticipant = function() {
        return mapper(gapi.hangout.getLocalParticipant());
    };
    that.setStatus = function(participantId, status) {
        gapi.hangout.data.setValue(participantId, status);
    };
    that.getStatus = function(participantId) {
        return gapi.hangout.data.getValue(participantId);
    };

    return that;
};

var renderer = function() {

    var add = function(participant) {
        var className = ( participant.isLocal() ? 'localParticipant' : '');
        var listName = '#' + participant.getStatus() + 'List';
        $(listName)
            .append($('<li/>')
            .addClass(className)
            .attr('id', participant.getId())
            .fadeIn(500)
            .text(participant.getName()));
    };
        
    var remove = function(participant, oldStatus) {
        var listName = '#' + oldStatus + 'List';
        var listItem = $(listName + ' li:contains("' + participant.getName() + '")');
        listItem.slideUp(500, 'linear', function () { $(this).remove();});
    }; 
        
    var move = function(participant, oldStatus) {
        remove(participant, oldStatus);
        add(participant);
    };

    return {
        add: add,
        remove: remove,
        move: move,
        statusChangedEventHandler: function(spec) {
            move(spec.participant, spec.lastStatus);
        },
    };
};

var canvasRenderer = function() {

    var getCircleName = function(status) {
        return '#' + status + 'Circle';        
    };

    var add = function(name, status) {
        var listeningGroup = canvas.getObjects()[0];
        var position = (listeningGroup.getObjects().length + 1) * 30;
        var text = new fabric.Text(name, {
            top: position,
            fontSize: 20,
            fontFamily: 'Courier New',
            textAlign: 'right'
        });
        var rect = new fabric.Rect({
            top: position,
            fill: 'red',
            width: 200,
            height: 20,
            rx: 10,
            strokeWidth: 2,
            stroke: 'blue'
            //ry: 20
        });
        var participantGroup = new fabric.Group([rect, text], {left: 150});
        
        listeningGroup.add(participantGroup);
        canvas.renderAll();
    };
            
    var remove = function(name, status) {
        var circleName = getCircleName(status);
        //$(listName + ' li:contains("' + name + '")').remove();
    }; 
        
    var move = function(name, oldStatus, newStatus) {
        remove(name, oldStatus);
        add(name, newStatus);
    };

    return {
        add: add,
        remove: remove,
        move: move,
        statusChangedEventHandler: function(spec) {
            move(spec.name, spec.lastStatus, spec.currentStatus);
        },
    };
};

var parkBenchPanel = function(repo, renderer) {

    var participantRepo = repo;
    var participantRenderer = renderer;
    var participants = null;

    var getParticipantCounts = function() {
        var counts = {
            speaker: 0,
            waiting: 0,
            listener: 0
        };
        $.each(participants, function(i, p) {
            counts[p.getStatus()]++;
        });
        return counts;
    };

    var getParticipantByName = function(name) {
        return $.grep(participants, function(p, i) {
            return p.getName() == name;
        })[0];
    };

    var getParticipantById = function(id) {
        return $.grep(participants, function(p, i) {
            return p.getId() == id;
        })[0];
    };

    var getParticipantsByStatus = function(status) {
        return $.grep(participants, function(p, i) {
            return p.getStatus() == status;
        });
    };

    var setParticipantsStatus = function(participants, status) {
        $.each(participants, function(i, p) {
            p.setStatus(status);
        });
    };

    var getRemoteParticipants = function() {
        return $.grep(participants, function(p, i) {
            return p.isLocal() === false;
        });
    };


    var setParticipantsStatusChangedEventHandler = function(participants, eventHandlers) {
        $.each(participants, function(i, p) {
            p.addOnStatusChangedHandlers(eventHandlers);
        });
    };

    var displayRemoteParticipants = function(f) {
        $.each(getRemoteParticipants(), function(i, p) {
            f(p);
        });
    };

    return {
        init: function() {
            participants = participantRepo.getParticipants(); //Todo: pass the renderer event handler to get participants
            setParticipantsStatusChangedEventHandler(participants, [ participantRenderer.statusChangedEventHandler ] );
            displayRemoteParticipants(participantRenderer.statusChangedEventHandler );
            var localParticipant = participantRepo.getLocalParticipant();
            localParticipant.setStatus('listener');
        },
        gotSomethingToSay: function(localParticipantName) {
            var participant = getParticipantByName(localParticipantName);
            var status = (getParticipantCounts().speaker < 2 ? 'speaker' : 'waiting');
            participant.setStatus(status);
        },
        doneTalkin: function(localParticipantName) {
            var participant = getParticipantByName(localParticipantName);
            participant.setStatus('listener');

            var waitingParticipants = getParticipantsByStatus('waiting');
            if (waitingParticipants.length > 0) {
                waitingParticipants[0].setStatus('speaker');
            }
        },
        getParticipants: function() {
            return participants;
        },
        newParticipantsJoined: function(newParticipants) {
            setParticipantsStatusChangedEventHandler(newParticipants, [ participantRenderer.statusChangedEventHandler ] );
            setParticipantsStatus(newParticipants, 'listener');            
            $.each(newParticipants, function(i, p) {
                participants.push(p);
            });
        },
        participantLeaves: function(participant) {
            participant.setStatus(undefined);
            participants = $.grep(participants, function(p) { return p.getId() != participant.getId() } );
        },
        
        otherParticipantsChangedStatus: function(stateChangedEvent) {
            //stateChangedEvents is more complicated
            //? use stateChangedEvents.state
            //also check that newParticipantsJoined is working correctly
            $.each(stateChangedEvent.state, function(id, status) {
                var p = getParticipantById(id);
                p.setStatus(status);                    
            });
        },
        start: function() {
            repo.start(this.newParticipantsJoined, this.participantLeaves, this.otherParticipantsChangedStatus, this.init);
        }
    };
};