
var getFakeHangout = function() {

    var stateList = [
        { '1' : 'listener' },
        { '2' : 'listener' },
        { '3' : 'listener' },
        { '4' : 'listener' },
        { '5' : 'listener' },
        { '6' : 'listener' }
    ];
    
    var getParticipants = function() {
        return [
            {
                id: 1,
                person: {
                    displayName: 'Bob (1)',
                },
        
            }, {
                id: 2,
                person: {
                    displayName: 'Fred (2)',
                },
            }, {
                id: 3,
                person: {
                    displayName: 'Bill (3)',
                },
            }, {
                id: 4,
                person: {
                    displayName: 'Joe (4)',
                },
            }, {
                id: 5,
                person: {
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
            var mapper = participantMapper(gapi);
            return mapper(localParticipant);
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
          participantEventHandlerSpy([p]);
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

gapi = { hangout : getFakeHangout() };