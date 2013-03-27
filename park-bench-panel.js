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
    var statusChangedEventHandlers = spec.statusChangedEventHandlers || [];

    that.getId = function() {
        return spec.id;
    };

    that.getName = function() {
        return spec.name;
    };

    that.getStatus = function() {
        return spec.status;
    };

    that.setStatus = function(status) {
        var lastStatus = spec.status;
        spec.status = status;
        $.each(statusChangedEventHandlers, function(i, h) {
            h({
                id: that.getId(),
                name: that.getName(),
                lastStatus: lastStatus,
                currentStatus: that.getStatus()
            });
        });
    };

    that.addOnStatusChangedHandlers = function(handlers) {
        $.each(handlers, function(i, h) {
            statusChangedEventHandlers.push(h);
        });
    };

    return that;
};

var participantMapper = function(gapi) {

    return function(googleParticipant) {
        
        var repositoryUpdatehandler = function(updateDetails) {
            var delta = {};
            delta[updateDetails.id] = updateDetails.currentStatus;
            gapi.hangout.data.submitDelta(delta);
        };

        return participant({
            id: googleParticipant.person.id,
            name: googleParticipant.person.displayName,
            status: gapi.hangout.data.getValue([googleParticipant.person.id]),
            statusChangedEventHandlers: [ repositoryUpdatehandler ],
        });
    };
};

var hangoutWrapper = function(gapi) {

    var getWrappedHandler = function(f) {
        
        return function(googleParticipants) {
            var mapper = participantMapper(gapi);
            var pbpParticipants = $.map(googleParticipants, mapper);
            f(pbpParticipants);
        };
    };

    var setup = function(newParticipantsJoinedHandler, stateChanged, init) {        
        gapi.hangout.onParticipantsAdded.add(getWrappedHandler(newParticipantsJoinedHandler));
        gapi.hangout.data.onStateChanged.add(stateChanged);
        init();
    };
    
    return {
        start: function(newParticipantsJoined, stateChanged, init) {
            if (gapi.hangout.isApiReady()) {
                setup(newParticipantsJoined, stateChanged, init);
            }
            else {
                var f = function() {
                    setup(newParticipantsJoined, stateChanged, init);
                };
                gapi.hangout.onApiReady.add(f);
            }
        },
        getParticipants: function(statusChangedEventHandlers) {
            return $.map(gapi.hangout.getParticipants(), participantMapper(gapi));
        },
        getLocalParticipant: function() {
            return gapi.hangout.getLocalParticipant();
        },
    };
};

var renderer = function() {
    return {
        add: function(name, status) {
            var listName = '#' + status + 'List';
            $(listName).append($('<li/>').text(name));
        },
        remove: function(name, status) {
            var listName = '#' + status + 'List';
            $(listName + ' li:contains("' + name + '")').remove();
        },
        move: function(name, oldStatus, newStatus) {
            this.remove(name, oldStatus);
            this.add(name, newStatus);
        },

        statusChangedEventHandler: function(spec) {
            this.move(spec.name, spec.lastStatus, spec.currentStatus);
        }
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

    var setParticipantsStatusChangedEventHandler = function(participants, eventHandlers) {
        $.each(participants, function(i, p) {
            p.addOnStatusChangedHandlers(eventHandlers);
        });
    };

    return {
        init: function() {
            participants = participantRepo.getParticipants();
            setParticipantsStatusChangedEventHandler(participants, [ participantRenderer.statusChangedEventHandler ] );
            setParticipantsStatus(participants, 'listener');            
        },
        gotSomethingToSay: function(localParticipantName) {
            var participant = getParticipantByName(localParticipantName);
            var status = (getParticipantCounts().speaker < 3 ? 'speaker' : 'waiting');
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
        otherParticipantsChangedStatus: function(stateChangedEvents) {
            $.each(stateChangedEvents, function(i, e) {
                for(var id in e)
                {
                    getParticipantById(id).setStatus(e[id]);
                }                
            });
        },
        start: function() {
            repo.start(this.newParticipantsJoined, this.otherParticipantsChangedStatus, this.init);
        }
    };
};