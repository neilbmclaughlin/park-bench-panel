var getFakeHangout = function() {

    var stateList = [];
    
    var getParticipants = function() {
        return [
            {
                person: {
                    id: '1',
                    displayName: 'Bob',
                },        
            }, {
                person: {
                    id: '2',
                    displayName: 'Fred',
                },
            }, {
                person: {
                    id: '3',
                    displayName: 'Bill',
                },
            }, {
                person: {
                    id: '4',
                    displayName: 'Joe',
                },
            }, {
                person: {
                    id: '5',
                    displayName: 'Alf',
                },
            }
        ];        
    };
    var participantEventHandlerSpy, stateChangedHandlerSpy;
    var participants;
    
    var localParticipant = getParticipants()[0]; 
    
    return {
        isApiReady: function() { return true; },
        getParticipants: function() { 
            participants = getParticipants();
            return participants;
        },
        onParticipantsAdded: {
            add: function(f) {
                participantEventHandlerSpy = f;
            }
        },
        data: {
            onStateChanged: {
                add: function(f) {
                    stateChangedHandlerSpy = f;
                }
            },
            getValue: function(key) {
                return stateList[key];
            },
            setValue: function(key, value) {
                stateList[key] = value;
            },
        },
        getLocalParticipant : function() {
            // var localParticipant = jQuery.grep(participants, function(p){
            //     return (p.person.displayName == $('#localParticipantSelect').val() );
            // })[0];
            return localParticipant;
        },
        participantSelectChanged : function() {
            localParticipant = jQuery.grep(participants, function(p){
                return (p.person.id == $('#localParticipantSelect').val() );
            })[0];            
        },
        addTestParticipant : function() {
          var id = participants.length + 1;
          var p = {
              person: {
                  id : id,
                  displayName : $('#displayName').val(),
              },
          };
          participants.push(p);
          participantEventHandlerSpy( { addedParticipants : [p] });
      },
        
    };
};

var testingRenderer = function() {
    
    var that = renderer();
    
    var super_add = that.add;
    var super_remove = that.remove;
    
    that.add = function(participant) {
        super_add(participant);
        var selectList = $('#localParticipantSelect');
        $('<option/>')
        .text(participant.getName())
        .attr({
            'selected' : participant.isLocal(),
            'value' : participant.getId()
        })
        .appendTo(selectList);
    };

    that.remove = function(participant, oldStatus) {
        super_remove(participant, oldStatus);
        $('#localParticipantSelect option[value=' + participant.getId() + ']').remove();;
    };

    that.move = function(participant, oldStatus) {
        that.remove(participant, oldStatus);
        that.add(participant);
    };

    that.statusChangedEventHandler = function(spec) {
        that.move(spec.participant, spec.lastStatus);
    };

    return that;
};

var testingCanvasRenderer = function() {
    
    var that = canvasRenderer();
    
    var super_add = that.add;
    var super_remove = that.remove;
    
    that.add = function(name, status) {
        super_add(name, status);
        $('#localParticipantSelect').append('<option>' + name + '</option>');
    };

    that.remove = function(name, status) {
        super_remove(name, status);
        $("#localParticipantSelect option[value='" + name + "']").remove();
    };

    that.move = function(name, oldStatus, newStatus) {
        that.remove(name, oldStatus);
        that.add(name, newStatus);
    };

    that.statusChangedEventHandler = function(spec) {
        that.move(spec.name, spec.lastStatus, spec.currentStatus);
    };

    return that;
};


gapi = { hangout : getFakeHangout() };

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

var participantMapper = function(gapi) {

    return function(googleParticipant) {
        
        var repositoryUpdatehandler = function(updateDetails) {
            gapi.hangout.data.setValue(updateDetails.participant.getId(), updateDetails.participant.getStatus());
        };

        return participant({
            id: googleParticipant.person.id,
            name: googleParticipant.person.displayName,
            status: gapi.hangout.data.getValue(googleParticipant.person.id),
            local: gapi.hangout.getLocalParticipant().person.id == googleParticipant.person.id,
            statusChangedEventHandlers: [ repositoryUpdatehandler ],
        });
    };
};

var hangoutWrapper = function(gapi) {

    var getWrappedHandler = function(f) {
        return function(newParticipantEvent) {
            var mapper = participantMapper(gapi);
            var pbpParticipants = $.map(newParticipantEvent.addedParticipants, mapper);
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
            var mapper = participantMapper(gapi);
            return mapper(gapi.hangout.getLocalParticipant());
        },
    };
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
        otherParticipantsChangedStatus: function(stateChangedEvent) {
            //stateChangedEvents is more complicated
            //? use stateChangedEvents.state
            //also check that newParticipantsJoined is working correctly
            $.each(stateChangedEvent.state, function(id, status) {
                var p = getParticipantById(id);
                if (p.getStatus() != status) {
                    p.setStatus(status);                    
                }
            });
        },
        start: function() {
            repo.start(this.newParticipantsJoined, this.otherParticipantsChangedStatus, this.init);
        }
    };
};var hangout = hangoutWrapper(gapi);
var renderer = testingRenderer();
var pbp = parkBenchPanel(hangout, renderer);

$(document).ready(function() {
    pbp.start();
});

function startTalk() {
    var localParticipantName = hangout.getLocalParticipant().getName();
    pbp.gotSomethingToSay(localParticipantName);
}

function stopTalk() {
    var localParticipantName = hangout.getLocalParticipant().getName();
    pbp.doneTalkin(localParticipantName);
}