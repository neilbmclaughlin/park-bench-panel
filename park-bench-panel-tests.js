test("Participant unordered list is created", function() {
    
    //arrange
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
    buildParticipantLists(pList);
        
    //assert
    var listItems = GetListItems("listenerList");
    
    equal(listItems.length, 2);
    equal(listItems[0].innerHTML, "Bob");
    equal(listItems[1].innerHTML, "Fred");
});

test("Participant speaker and listener lists are created", function() {
    
    //arrange
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
    buildParticipantLists(pList);
        
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
            
 
    //act
    startTalk(p1);

        
    //assert
    fail('Not implemented yet');
    
});

test("New participant added to the participant list", function() {
    
    //arrange
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
    buildParticipantLists([p1]);
    
    //act
    newParticipantJoined( { addedParticipants : [p2] } );
        
    //assert
    var listItems = GetListItems("participantList");
        
    equal(listItems.length, 2);
    equal(listItems[0].innerHTML, "Bob");
    equal(listItems[1].innerHTML, "Fred");
});

function GetListItems(listName) {
    return document
        .getElementById(listName)
        .getElementsByTagName("li");
};
