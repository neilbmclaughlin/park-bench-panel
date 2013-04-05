
var getFakeHangout = function() {

    var stateList = {
         '1' : 'listener',
         '2' : 'listener',
         '3' : 'listener',
         '4' : 'listener',
         '5' : 'listener',
         '6' : 'listener'
    };
    
    var getParticipants = function() {
        return [
            {
                person: {
                    id: '1',
                    displayName: 'Bob (1)',
                },        
            }, {
                person: {
                    id: '2',
                    displayName: 'Fred (2)',
                },
            }, {
                person: {
                    id: '3',
                    displayName: 'Bill (3)',
                },
            }, {
                person: {
                    id: '4',
                    displayName: 'Joe (4)',
                },
            }, {
                person: {
                    id: '5',
                    displayName: 'Alf (5)',
                },
            }
        ];        
    };
    var participantEventHandlerSpy, stateChangedHandlerSpy;
    var participants;

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
                return stateList[key] = value;
            },
        },
        getLocalParticipant : function() {
            var localParticipant = jQuery.grep(participants, function(p){
                return (p.person.displayName == $('#localParticipantSelect').val() );
            })[0];
            return localParticipant;
        },        
        addTestParticipant : function() {
          var id = $('#participantId').val() * 1;
          var p = {
              person: {
                  id : id,
                  displayName : $('#displayName').val() + ' (' + id + ')',
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