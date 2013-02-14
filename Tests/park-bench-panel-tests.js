test("Participant unordered list is created", function() {
    
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
                status : 'listener'
            };

    var pList = [p1, p2];
    
    //act
    pbp.buildParticipantLists(pList);
        
    //assert
    var listItems = GetListItems("listenerList");
    
    equal(listItems.length, 2);
    equal(listItems[0].innerHTML, "Bob");
    equal(listItems[1].innerHTML, "Fred");
});

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
        setParticipantAsSpeaker : function(delta) { passedDelta = delta },
        getParticipants : function() { return [p1, p2]; }
    });
 
    //act
    pbp.startTalk(p1);

        
    //assert
    console.log(passedDelta);
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
        setParticipantAsSpeaker : function(delta) { passedDelta = delta }
    });

    //act
    pbp.startTalk(p4);
        
    //assert
    equal(passedDelta[p4['id']], 'waiting');

});

test("New participant added to the participant list", function() {
    
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
