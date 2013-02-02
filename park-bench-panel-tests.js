test("Participant unordered list is created", function() {
    
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

    var pList = [p1, p2];
    
    //act
    buildParticipantList(pList);
        
    //assert
    var listItems = document
        .getElementById("participantList")
        .getElementsByTagName("li");
    
    
    equal(listItems.length, 2);
    equal(listItems[0].innerHTML, "Bob");
    equal(listItems[1].innerHTML, "Fred");
});

test("A request to speak moves the local participant from the participant queue to the speaker queue", function() {
    
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
            
    buildParticipantList([p1, p2]);
 
    //act
    startTalk(p1);
        
    //assert
    var participantItems = document
        .getElementById("participantList")
        .getElementsByTagName("li");
    equal(participantItems.length, 1, 'participantList should have just one entry');
    equal(participantItems[0].innerHTML, "Fred");

    var speakerItems = document
        .getElementById("speakerList")
        .getElementsByTagName("li");
    equal(speakerItems.length, 1, 'speakerList should have just one entry');
    equal(speakerItems[0].innerHTML, "Bob");
    
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
    buildParticipantList([p1]);
    
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
