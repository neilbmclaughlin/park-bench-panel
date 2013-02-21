test("Participant speaker, waiting and listener lists are created", function() {
    
    //arrange
    var pbp = new parkBenchPanel();
    var p1 = { 
                person : { 
                    displayName : 'Bob',
                },
                status : 'listener'

            }; 
    var p2 = { 
                person : { 
                    displayName : 'Fred',
                },
                status : 'speaker'
            };
    var p3 = { 
                person : { 
                    displayName : 'Bill',
                },
                status : 'waiting'
            };

    var pList = [p1, p2, p3];
    
    //act
    pbp.buildParticipantLists(pList);
        
    //assert
    var listItems = GetListItems("listenerList");
    equal(listItems.length, 1);
    equal(listItems[0].innerHTML, "Bob");
    
    var listItems = GetListItems("speakerList");
    equal(listItems.length, 1);
    equal(listItems[0].innerHTML, "Fred");

    //Note: in live app should not be able to have a waiting entry
    //when the number of speakers is less than the max number of speakers
    var listItems = GetListItems("waitingList");
    equal(listItems.length, 1);
    equal(listItems[0].innerHTML, "Bill");
});

test("A request to speak updates the speaker list in state", function() {
    
    //arrange
    var passedDelta = {};
        
    var p1 = {
                id : 1,
                person : { 
                    displayName : 'Bob',
                } 
            }; 
    var p2 = {
                id : 2,
                person : { 
                    displayName : 'Fred',
                }    
            };
    
    var pbp = new parkBenchPanel( { 
        setParticipantStatus : function(delta) { passedDelta = delta },
        getParticipants : function() { return [p1, p2]; },
        displayNotice : function() { }
    });
 
    //act
    pbp.startTalk(p1);

        
    //assert
    equal(passedDelta[1], 'speaker' );
    
});

test("If there are already 3 speakers then a participant who wants to speak should have status set to waiting", function() {
    
    //arrange
    var passedDelta = {};
         
    var p1 = {
        id : 1, 
        person : { displayName : 'Bob' }, 
        status : 'speaker'
    }; 
    var p2 = {
        id : 2,
        person : { displayName : 'Fred' },   
        status : 'speaker'
    };

    var p3 = {
        id : 3,
        person : { displayName : 'Bill' },   
        status : 'speaker'
    };
    var p4 = {
        id : 4,
        person : { displayName : 'Joe' },
        status : 'listener'
    };

    var pbp = new parkBenchPanel( { 
        getParticipants : function() { return [p1, p2, p3, p4]; },
        setParticipantStatus : function(delta) { passedDelta = delta },
        displayNotice : function() { }
    });

    //act
    pbp.startTalk(p4);
        
    //assert
    equal(passedDelta[p4['id']], 'waiting');

});

test("If a speaker stops speaking and there is a participant waiting then they should be moved to the speaker list", function() {
    //arrange
    var passedDeltas = {};
         
    var p1 = {
        id : 1, 
        person : { displayName : 'Bob' }, 
        status : 'speaker'
    }; 
    var p2 = {
        id : 2,
        person : { displayName : 'Fred' },   
        status : 'speaker'
    };

    var p3 = {
        id : 3,
        person : { displayName : 'Bill' },   
        status : 'speaker'
    };
    var p4 = {
        id : 4,
        person : { displayName : 'Joe' },
        status : 'waiting'
    };
    var pbp = new parkBenchPanel( { 
        getParticipants : function() { return [p1, p2, p3, p4]; },
        setParticipantStatus : function(deltas) { passedDeltas = deltas },
        displayNotice : function() { }
    });

    //act
    pbp.stopTalk(p3);
        
    //assert
    equal(Object.keys(passedDeltas).length, 2, 'Expect 2 participant statuses to be updated');
    equal(passedDeltas[p3['id']], 'listener', 'Expect speaking participant #3 to be set to listener');    
    equal(passedDeltas[p4['id']], 'speaker', 'Expect waiting participant #4 to be set to speaker');
    
    var listItems = GetListItems("waitingList");
    equal(listItems.length, 0);

});

test("If a speaker goes into the waiting queue then a notice should be displayed", function() {
    
    //arrange
         
    var p1 = {
        id : 1, 
        person : { displayName : 'Bob' }, 
        status : 'speaker'
    }; 
    var p2 = {
        id : 2,
        person : { displayName : 'Fred' },   
        status : 'speaker'
    };

    var p3 = {
        id : 3,
        person : { displayName : 'Bill' },   
        status : 'speaker'
    };
    var p4 = {
        id : 4,
        person : { displayName : 'Joe' },
        status : 'listener'
    };

    var passedDisplayValues = {};
    var pbp = new parkBenchPanel( { 
        getParticipants : function() { return [p1, p2, p3, p4]; },
        setParticipantStatus : function() { },
        displayNotice : function(displayValues) { passedDisplayValues = displayValues }
    });

    //act
    pbp.startTalk(p4);
        
    //assert
    equal(passedDisplayValues['message'], 'Joe is waiting to speak');

});

test("If a speaker goes into the speaker queue then a notice should be displayed", function() {
    
    //arrange
         
    var p1 = {
        id : 1, 
        person : { displayName : 'Bob' }, 
        status : 'speaker'
    }; 
    var p2 = {
        id : 2,
        person : { displayName : 'Fred' },   
        status : 'speaker'
    };

    var p3 = {
        id : 3,
        person : { displayName : 'Joe' },
        status : 'listener'
    };

    var passedDisplayValues = {};
    var pbp = new parkBenchPanel( { 
        getParticipants : function() { return [p1, p2, p3]; },
        setParticipantStatus : function() { },
        displayNotice : function(displayValues) { passedDisplayValues = displayValues }
    });

    //act
    pbp.startTalk(p3);
        
    //assert
    equal(passedDisplayValues['message'], 'Joe is about to speak');

});

test("If a new participant is added then they should go into the participant list", function() {
    
    //arrange
    var pbp = new parkBenchPanel();
    var p1 = {
        id : 1, 
        person : { displayName : 'Bob' }, 
        status : 'listener'
    }; 
    var p2 = {
        id : 2,
        person : { displayName : 'Fred' },   
    };
    
    pbp.buildParticipantLists([p1]);
    
    //act
    pbp.newParticipantJoined( { addedParticipants : [p2] } );
        
    //assert
    var listItems = GetListItems("listenerList");
        
    equal(listItems.length, 2);
    equal(listItems[0].innerHTML, "Bob");
    equal(listItems[1].innerHTML, "Fred");
});

function GetListItems(listName) {
    return document
        .getElementById(listName)
        .getElementsByTagName("li");
};
