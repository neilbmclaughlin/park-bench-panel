//Test Suite 


var participantService = function(hangout, renderer) {

    return {
        participantMapper : function(p ,i) {
            return {
                id : p.person.id,
                displayName : p.person.displayName,
                setStatus : function(status) {
                    renderer.move(this.displayName, this.getStatus(), status);
                    hangout.saveStatus(this.id, status);
                },
                getStatus : function() {
                    return hangout.getStatus(this.id);
                },
                display : function() {
                    renderer.add();
                },
            };
        }            
    };
};

var parkBenchPanel = {};

module( "Unit tests");

test("Can add an entry to a list", function() {

    //arrange
    var r = renderer;
    
    //act
    r.add("Bob", "listener");

    //assert
    var listItems = GetListItems("listenerList");
    equal(listItems.length, 1);
    equal(listItems[0].innerHTML, "Bob");

});

test("Can remove an entry from a list", function() {

    //arrange
    var r = renderer;
    r.add("Bob", "listener");
    
    //act
    r.remove("Bob", "listener");

    //assert
    var listItems = GetListItems("listenerList");
    equal(listItems.length, 0);
    
});

test("Can move a entry between lists", function() {

    //arrange
    var r = renderer;
    r.add("Bob", "listener");
    
    //act
    r.move("Bob", "listener", "speaker");

    //assert
    var listItems = GetListItems("listenerList");
    equal(listItems.length, 0);
    var listItems = GetListItems("speakerList");
    equal(listItems.length, 1);
    
});

test("Can create a new participant from a hangout particpant", function() {
    //arrange
    var hangoutParticipant = {
        person : {
            id : 1,
            displayName : 'Bob',
        },
    };
    
    var ps = participantService(null, null);
    
    //act
    var p = ps.participantMapper(hangoutParticipant);
    
    //assert
    equal(p.id, 1);
    equal(p.displayName, 'Bob');
});

test("Setting status for participant saves status and renders a move", function() {
    //arrange
    var hangoutPassedStatus = '', hangoutPassedParticipantId = '';
    var rendererPassedName = '', rendererPassedOldStatus = '', rendererPassedNewStatus = '';
    
    var fakeHangout = {
        saveStatus : function(participantId, status) {
            hangoutPassedParticipantId = participantId;
            hangoutPassedStatus = status; 
        },
        getStatus : function() { return 'listener' },
        displayNotice : function(message) {},
    };
    
    var fakeRenderer = {
        move : function(name, oldStatus, newStatus) {
            rendererPassedName = name;
            rendererPassedOldStatus = oldStatus;
            rendererPassedNewStatus = newStatus;
        }
    };
    
    var ps = participantService(fakeHangout, fakeRenderer);
    
    var hangoutParticipant = {
        person : {
            id : 1,
            displayName : 'Bob',
        },
    };

    
    var p = ps.participantMapper(hangoutParticipant);
    
    //act
    p.setStatus('speaker');
    
    //assert
    equal(hangoutPassedParticipantId, 1);
    equal(hangoutPassedStatus, 'speaker')

    equal(rendererPassedName, 'Bob')
    equal(rendererPassedOldStatus, 'listener')
    equal(rendererPassedNewStatus, 'speaker')
});

module( "Acceptance tests");

test("When a PBP starts it should display participants", function() { 
    
    //arrange
    pbp = parkBenchPanel;
    
    //act
    
    //assert
    ok(false, 'not implemented') });

test("A participant wants to talk: if less than 3 speakers they should be moved to the speaker list", function() { ok(false, 'not implemented') });

test("A participant wants to talk: if 3 speakers they should be moved to the waiting list", function() { ok(false, 'not implemented') });

test("description", function() { ok(false, 'not implemented') });



function GetListItems(listName) {
    return document
        .getElementById(listName)
        .getElementsByTagName("li");
};
