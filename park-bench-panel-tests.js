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