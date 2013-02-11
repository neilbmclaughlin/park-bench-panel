test("Participant unordered list is created", function() {
    
    //arrange
    var pbp = new parkBenchPanel();
    var p1 = { 
                person : { 
                    displayName : 'Bob',
                    age : 21
                },
                isSpeaker : false
            }; 
    var p2 = { 
                person : { 
                    displayName : 'Fred',
                    age : 42 
                },
                isSpeaker : false
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

test("Participant speaker and listener lists are created", function() {
    
    //arrange
    var pbp = new parkBenchPanel();
    var p1 = { 
                person : { 
                    displayName : 'Bob',
                    age : 21
                },
                isSpeaker : false

            }; 
    var p2 = { 
                person : { 
                    displayName : 'Fred',
                    age : 42 
                },
                isSpeaker : true
            };

    var pList = [p1, p2];
    
    //act
    pbp.buildParticipantLists(pList);
        
    //assert
    var listItems = GetListItems("listenerList");
    equal(listItems.length, 1);
    equal(listItems[0].innerHTML, "Bob");
    
    var listItems = GetListItems("speakerList");
    equal(listItems.length, 1);
    equal(listItems[0].innerHTML, "Fred");
});



test("A request to speak updates the speaker list in state", function() {
    
    //arrange
    var passedDelta = {};
    
    var f = function(delta) { 
        passedDelta = delta;
    };
    
    var pbp = new parkBenchPanel({ setParticipantAsSpeaker : f });
    var p1 = {
                id : 1,
                person : { 
                    displayName : 'Bob',
                    age : 21
                } 
            }; 
    var p2 = {
                id : 2,
                person : { 
                    displayName : 'Fred',
                    age : 42 
                }    
            };
            
 
    //act
    pbp.startTalk(p1);

        
    //assert
    console.log(passedDelta);
    equal(passedDelta[1], 'speaker' );
    
});

test("A request to speak displays message when there are already 3 speakers", function() {
    
    //arrange
    var passedDelta = false;
    
    var f = function(delta) { 
        passedDelta = true;
    };
    
    var pbp = new parkBenchPanel({ setParticipantAsSpeaker : f });
    var p1 = {
                id : 1,
                person : { 
                    displayName : 'Bob',
                    age : 21
                } 
            }; 
    var p2 = {
                id : 2,
                person : { 
                    displayName : 'Fred',
                    age : 42 
                }    
            };
            
 
    //act
    pbp.startTalk(p1);

        
    //assert
    console.log(passedDelta);
    equal(passedDelta, false );
    var errorMessage = document.getElementById("errorMessage");
    equal(errorMessage.visible, true);
    
});


test("New participant added to the participant list", function() {
    
    //arrange
    var pbp = new parkBenchPanel();
    var p1 = { 
                person : { 
                    displayName : 'Bob',
                    age : 21
                } 
            }; 
    var p2 = { 
                person : { 
                    displayName : 'Fred',
                    age : 42 
                }    
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
