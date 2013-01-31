test("Dummy Test", function() {
    equal(aMethod(), "boo");
});

test("Participant unordered list is created", function() {
    
    //arrange
    var pList = {
        person : {
            displayName : 'Bob'
        },
        person : {
            displayName : 'Fred'
        },    
    }
    
    //act
    buildParticipantList(pList);
        
    //assert
    var listItems = document
        .getElementById("qunit-fixture")
        .getElementById("participantList")
        .getElementsByTagName("li");
    
    
    equal(listItems.length, 2);
    equal(listItems[0].innerHTML, "Bob");
    equal(listItems[1].innerHTML, "Bill");
});