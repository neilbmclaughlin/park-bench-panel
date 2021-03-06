
var getPbpParticipants = function(spec) {
    return $.map(
        spec.nameList.split(','),
        function(n, i) {
            var local = false;
            if (n[n.length] == '*')
            {
                local = true;
                n = n.substring(0, n.length - 1);
            }
            return participant( {
                name : n,
                id : (i + 1).toString(),
                status : spec.status,
                local : local,
                statusChangedEventHandlers : spec.statusChangedEventHandlers || []
        } ) }
    );
};

var getGoogleParticipants = function(nameList) {
    return $.map(
        nameList.split(','),
        function(n, i) { return { 
            person : { 
                id : (i + 1).toString(), //TODO: decide if we need to use person.id or id
                displayName : n,
                }, 
            };
        });
};

describe("A participant mapper", function() {
    
    var googleParticipants, localParticipant, fakeGoogleApi;
    
    beforeEach(function() {
        googleParticipants = getGoogleParticipants('Bob,Fred');
        localParticipant = googleParticipants[0];
        //var stateList = { '1' :'speaker', '2' : 'listener' };
        fakeGoogleApi = {
            hangout : {
                data: {
                    setValue:  jasmine.createSpy('setValue'),
                    getValue:  jasmine.createSpy('getValue').andReturn('listener'),
                },
                getLocalParticipant : jasmine.createSpy('getLocalParticipant').andReturn(localParticipant)
            },
        };
        
    });
    
    afterEach(function() {
        expect(fakeGoogleApi.hangout.getLocalParticipant).toHaveBeenCalled();        
    });

    it("should be able to map from a google participant to a pbp participant", function() {
        
        //Arrange
        var mapper = participantMapper(fakeGoogleApi);
        
        //Act
        var participant = mapper(googleParticipants[0]);
        
        //Assert        
        expect(participant.getId()).toEqual('1');
        expect(participant.getName()).toEqual('Bob');
        expect(participant.getStatus()).toEqual('listener');
        expect(fakeGoogleApi.hangout.data.getValue).toHaveBeenCalledWith('1');
    });

    describe("should set to participant local flag", function() {
        
        it("to true when the participant is local", function() {
            //Arrange
            localParticipant = googleParticipants[0];
            fakeGoogleApi.hangout.getLocalParticipant = jasmine.createSpy('getLocalParticipant').andReturn(localParticipant)
    
            var mapper = participantMapper(fakeGoogleApi);
            
            //Act
            var participant = mapper(googleParticipants[0]);
            
            //Assert        
            expect(participant.isLocal()).toEqual(true);
        });
        it("to false when the participant is not local", function() {
            //Arrange
            localParticipant = googleParticipants[1];
            fakeGoogleApi.hangout.getLocalParticipant = jasmine.createSpy('getLocalParticipant').andReturn(localParticipant)
    
            var mapper = participantMapper(fakeGoogleApi);
            
            //Act
            var participant = mapper(googleParticipants[0]);
            
            //Assert        
            expect(participant.isLocal()).toEqual(false);
        });

    });

});

describe("A hangout wrapper", function() {

    var hangout, fakeGoogleHangout, newParticipantsJoinedHandler, stateChangedHandler, init;
    
    beforeEach(function() {

        newParticipantsJoinedHandler = function() {};
        stateChangedHandler = function() {};
        init = jasmine.createSpy('init');
    });

    it("should notify subscribers when a new participant joins", function() {
        
        //Arrange
        var newParticipantHandler = null;
        var init = jasmine.createSpy('init');
        var stateChanged = jasmine.createSpy('stateChanged');
        var newParticipantsJoined = jasmine.createSpy('newParticipantsJoined');
        var googleParticipants = getGoogleParticipants('Bob,Fred');
        
        fakeGoogleHangout = {
            isApiReady : jasmine.createSpy('isApiReady').andReturn(true),            
            onParticipantsAdded : { add : function(f) { newParticipantHandler = f; } },
            data: {
                onStateChanged : { add : jasmine.createSpy('onStateChanged.add') },
                setValue:  jasmine.createSpy('setValue'),
                getValue : jasmine.createSpy('getValue').andReturn('listener'),

            },
            getLocalParticipant : jasmine.createSpy('getLocalParticipant').andReturn(googleParticipants[0]),
        };
        hangout = hangoutWrapper({ hangout: fakeGoogleHangout });
        hangout.start(newParticipantsJoined, stateChanged, init);
        
        //Act
        newParticipantHandler({ addedParticipants : googleParticipants });

        //Assert
        expect(newParticipantsJoined.callCount).toEqual(1);
        expect(newParticipantsJoined.calls[0].args[0][0].getName()).toEqual('Bob');        
        expect(newParticipantsJoined.calls[0].args[0][1].getName()).toEqual('Fred');        
        
    });

    describe("when a participant changes status", function() {

        //Arrange
        var statusChangedHandler = null;
        var subscriberStatusChangedHandler = jasmine.createSpy('stateChanged');
        var newParticipantsJoined = jasmine.createSpy('newParticipantsJoined');
        var init = jasmine.createSpy('init');
        var googleParticipants = getGoogleParticipants('Bob,Fred');
        
        fakeGoogleHangout = {
            isApiReady : jasmine.createSpy('isApiReady').andReturn(true),            
            onParticipantsAdded : { add : jasmine.createSpy('onParticipantsAdded.add') },
            data: {
                onStateChanged : { add : function(f) { statusChangedHandler = f} },
                setValue:  jasmine.createSpy('setValue'),
                getValue : jasmine.createSpy('getValue').andReturn('listener'),

            },
            getLocalParticipant : jasmine.createSpy('getLocalParticipant').andReturn(googleParticipants[0]),
        };
        hangout = hangoutWrapper({ hangout: fakeGoogleHangout });
        hangout.start(newParticipantsJoined, subscriberStatusChangedHandler, init);
        
        //Act
        statusChangedHandler([ { '2' : 'speaker' } ]); //This is a fake - not sure of the value of these tests


        it("then subscribers should be notified", function() {     
            expect(subscriberStatusChangedHandler.callCount).toEqual(1);
            expect(subscriberStatusChangedHandler.calls[0].args[0]).toEqual([ { 2 : 'speaker' }]);        
             
        });
        
        it("then the repository should not be called", function() {     
            expect(subscriberStatusChangedHandler.callCount).toEqual(1);
            expect(fakeGoogleHangout.data.setValue).not.toHaveBeenCalled();
        });
        
    });

    describe("when a hangout starts", function() {
        
        describe("if the gapi is ready", function() {

            beforeEach(function() {
                fakeGoogleHangout = {
                    isApiReady : jasmine.createSpy('isApiReady').andReturn(true),
                    onParticipantsAdded : { add : jasmine.createSpy('onParticipantsAdded.add') },
                    data : { 
                        onStateChanged : { add : jasmine.createSpy('onStateChanged.add') }
                    }, 
                };
                hangout = hangoutWrapper({ hangout : fakeGoogleHangout });
                hangout.start(newParticipantsJoinedHandler, stateChangedHandler, init);
            });
            
            it("then the event handler for handling new participants should be wired in", function() {
                expect(fakeGoogleHangout.onParticipantsAdded.add).toHaveBeenCalled(); //Not easy to assert calledWith       
            }); 
            it("then the event handler for handling changes to participant state should be wired in", function() {
                expect(fakeGoogleHangout.data.onStateChanged.add).toHaveBeenCalledWith(stateChangedHandler)       
            }); 
            it("then the initialiser has been called", function() {
                expect(init).toHaveBeenCalled();    
            }); 
            
        })

        describe("if the gapi is not ready", function() {

            beforeEach(function() {
                fakeGoogleHangout = {
                    isApiReady : jasmine.createSpy('isApiReady').andReturn(false),
                    onApiReady : { add : jasmine.createSpy('onApiReady.add') } ,                
                };
                hangout = hangoutWrapper({ hangout : fakeGoogleHangout });
                hangout.start(newParticipantsJoinedHandler, stateChangedHandler, init);
            });
            it("then the setup should wait until it is ready", function() {
                expect(fakeGoogleHangout.onApiReady.add).toHaveBeenCalled();       
            });  
        });
    });
    

});

describe("A list renderer", function() {

    var r;
    var GetListItems = function(listName) {
        return document.getElementById(listName).getElementsByTagName("li");
    };

    beforeEach(function() {
        $.fx.off = true; //Turn jQuery animations off to prevent timing issues
        r = renderer();
        $("#speakerList").empty();
        $("#waitingList").empty();
        $("#listenerList").empty();
    });

    it("Can respond to notification of a change of status for a participant", function() {
        
        var p1 = participant( { id: 1, name: 'Bob', status: 'speaker', local: true } );
        //act
        r.statusChangedEventHandler({
            participant: p1,
            lastStatus: 'listener',
        });

        //assert
        expect(GetListItems("speakerList").length).toEqual(1);
        expect(GetListItems("speakerList")[0].innerHTML).toEqual("Bob");
        expect(GetListItems("speakerList")[0].className).toEqual("localParticipant");

    });

    describe("Local participant should be identifiable", function() {
        
        it("Adding participants to a list should identify the local participant", function() {

            var p1 = participant( { id: 1, name: 'Bob', status: 'listener', local: true } );
            var p2 = participant( { id: 1, name: 'Fred', status: 'listener', local: false } );
            //act
            r.add(p1);
            r.add(p2);
    
            //assert
            expect(GetListItems("listenerList").length).toEqual(2);
            expect(GetListItems("listenerList")[0].innerHTML).toEqual("Bob");
            expect(GetListItems("listenerList")[0].className).toEqual("localParticipant");
            expect(GetListItems("listenerList")[1].innerHTML).toEqual("Fred");
            expect(GetListItems("listenerList")[1].className).toEqual("");
    
        });

        it("Moving participants between lists should preserve the identification of the local participant", function() {

            //arange
            var p1 = participant( { id: 1, name: 'Bob', status: 'listener', local: true } );
            var p2 = participant( { id: 2, name: 'Fred', status: 'listener', local: false } );
            r.add(p1);
            r.add(p2);
            p1.setStatus('speaker');

            //act
            r.move(p1, 'listener');
    
            //assert
            expect(GetListItems("listenerList").length).toEqual(1);
            expect(GetListItems("listenerList")[0].innerHTML).toEqual("Fred");
            expect(GetListItems("listenerList")[0].className).toEqual("");
            expect(GetListItems("speakerList").length).toEqual(1);
            expect(GetListItems("speakerList")[0].innerHTML).toEqual("Bob");
            expect(GetListItems("speakerList")[0].className).toEqual("localParticipant");
    
        });

    });

    it("New participants will not have a last status and should just be added to the listener list", function() {
        //act
        var p1 = participant( { id: 1, name: 'Bob', status: 'listener', local: true } );
        r.statusChangedEventHandler({
            participant: p1,
        });

        //assert
        expect(GetListItems("listenerList").length).toEqual(1);
        expect(GetListItems("waitingList").length).toEqual(0);
        expect(GetListItems("speakerList").length).toEqual(0);
        expect(GetListItems("listenerList")[0].innerHTML).toEqual("Bob");

    });

    it("Can add multiple entries to a list", function() {

        var p1 = participant( { id: 1, name: 'Bob', status: 'listener', local: true } );
        var p2 = participant( { id: 1, name: 'Fred', status: 'listener', local: false } );
        //act
        r.add(p1);
        r.add(p2);

        //assert
        expect(GetListItems("listenerList").length).toEqual(2);
        expect(GetListItems("listenerList")[0].innerHTML).toEqual("Bob");
        expect(GetListItems("listenerList")[1].innerHTML).toEqual("Fred");

    });

    it("Can add an entry to a list", function() {

        var p1 = participant( { id: 1, name: 'Bob', status: 'listener', local: true } );
        

        //act
        r.add(p1);

        //assert
        expect(GetListItems("listenerList").length).toEqual(1);
        expect(GetListItems("listenerList")[0].innerHTML).toEqual("Bob");

    });


    it("Can remove an entry from a list", function() {

        var p1 = participant( { id: 1, name: 'Bob', status: 'listener', local: true } );
        r.add(p1);
        

        //act
        r.remove(p1, 'listener');

        //assert
        expect(GetListItems("listenerList").length).toEqual(0);
        //expect(GetListItems("listenerList")[0].innerHTML).toEqual("Fred");

    });

    it("Can move a entry between lists", function() {

        //arrange
        var p1 = participant( { id: 1, name: 'Bob', status: 'listener', local: true } );
        r.add(p1);
        p1.setStatus('speaker');

        //act
        r.move(p1, "listener");

        //assert
        expect(GetListItems("listenerList").length).toEqual(0);
        expect(GetListItems("speakerList").length).toEqual(1);

    });

});

describe("A participant", function() {

    it("should notify subscribers of status changes", function() {
        //arrange
        var p1 = participant({
            name: 'Bob',
            id: 1,
            status: 'listener'
        });
        var statusChangedHandler1 = jasmine.createSpy('statusChangedHandler1');
        var statusChangedHandler2 = jasmine.createSpy('statusChangedHandler2');
        p1.addOnStatusChangedHandlers([statusChangedHandler1, statusChangedHandler2]);

        //Act
        p1.setStatus('speaker');

        //Assert
        expect(p1.getStatus()).toEqual('speaker');
        expect(statusChangedHandler1).toHaveBeenCalledWith({
            id: p1.getId(),
            name: p1.getName(),
            lastStatus: 'listener',
            currentStatus: 'speaker'
        });
        expect(statusChangedHandler2).toHaveBeenCalledWith({
            id: p1.getId(),
            name: p1.getName(),
            lastStatus: 'listener',
            currentStatus: 'speaker'
        });
    });
});

describe("A Park Bench Panel", function() {

    var p1, p2, p3, p4, participantList;
    var fakeRenderer, fakeRepository;
    var pbp;
    
    var getAddValidator = function(name, status) {
        return function(c, i) {
            return c.args[0] == name && c.args[1] == status;
        };
    };
            
    describe("when initialising the park bench panel", function() {

        var pList = [], participantStatusChangedEventHandler;
        
        beforeEach(function() {

            participantStatusChangedEventHandler = jasmine.createSpy('statusChangedEventHandler');
            pList = getPbpParticipants( { nameList: 'Bob,Fred,Bill', statusChangedEventHandlers : [ participantStatusChangedEventHandler ] } );

            fakeRenderer = jasmine.createSpyObj('renderer', ['statusChangedEventHandler', 'add', 'move']);
            fakeRenderer.statusChangedEventHandler = jasmine.createSpy('statusChangedEventHandler');
            fakeRepository = jasmine.createSpyObj('repo', ['statusChangedEventHandler', 'getParticipants']);
            fakeRepository.getParticipants.andReturn(pList);            

            pbp = parkBenchPanel(fakeRepository, fakeRenderer);

            //Act
            pbp.init();

        });

        it("then the current list of participants should be loaded", function() {
            expect(fakeRepository.getParticipants).toHaveBeenCalled();
        });
        it("then subscribers should be notified", function() {
            expect(participantStatusChangedEventHandler.callCount).toEqual(3);
        });
    });

    describe("when I am a listener and I request to speak", function() {

        describe("given there are currently no speakers", function() {
            
            var pList = [], statusChangedEventHandler;
            
            beforeEach(function() {
                            
                statusChangedEventHandler = jasmine.createSpy('statusChangedEventHandler');
                pList = getPbpParticipants( { nameList: 'Bob,Fred,Bill', statusChangedEventHandlers : [ statusChangedEventHandler ] } );
                
                fakeRenderer = jasmine.createSpyObj('renderer', ['statusChangedEventHandler', 'add', 'move']);
                fakeRepository = jasmine.createSpyObj('repo', ['statusChangedEventHandler', 'getParticipants']);
                fakeRepository.getParticipants.andReturn(pList);            

                pbp = parkBenchPanel(fakeRepository, fakeRenderer);
                pbp.init();
                pbp.gotSomethingToSay('Bill');
            });
            
            it("then my status should be set to speaker", function() {
                expect(pList[2].getStatus()).toEqual('speaker');
            });
            it("then any subscribers should have been notified.", function() {
                expect(statusChangedEventHandler).toHaveBeenCalledWith({
                    id: pList[2].getId(),
                    name: pList[2].getName(),
                    lastStatus: 'listener',
                    currentStatus: 'speaker'
                });
            });
        });
        
        describe("given there are currently 3 speakers", function() {
            
            beforeEach(function() {

                statusChangedEventHandler = jasmine.createSpy('statusChangedEventHandler');
                pList = getPbpParticipants( { nameList: 'Bob,Fred,Bill,Joe', statusChangedEventHandlers : [ statusChangedEventHandler ] } );
                
                fakeRenderer = jasmine.createSpyObj('renderer', ['statusChangedEventHandler', 'add', 'move']);
                fakeRepository = jasmine.createSpyObj('repo', ['statusChangedEventHandler', 'getParticipants']);
                fakeRepository.getParticipants.andReturn(pList);            

                pbp = parkBenchPanel(fakeRepository, fakeRenderer);
                pbp.init();
                pbp.gotSomethingToSay('Bob');
                pbp.gotSomethingToSay('Fred');
                pbp.gotSomethingToSay('Bill');
                pbp.gotSomethingToSay('Joe');
            });
            it("then the listener status should be set to waiting", function() {
                expect(pList[3].getStatus()).toEqual('waiting');
            });
            it("then the renderer should update the display", function() {
                expect(statusChangedEventHandler).toHaveBeenCalledWith({
                    id: pList[3].getId(),
                    name: pList[3].getName(),
                    lastStatus: 'listener',
                    currentStatus: 'waiting'
                });
            });
        });

    });
    
    describe("when I am a speaker and I request to stop speaking", function() {

        var pList = [], statusChangedEventHandler;
        
        beforeEach(function() {
        
            statusChangedEventHandler = jasmine.createSpy('statusChangedEventHandler');
    
            pList = getPbpParticipants( { nameList: 'Bob,Joe', status : 'listener', statusChangedEventHandlers : [ statusChangedEventHandler ] } );
            pList = pList.concat( getPbpParticipants( { nameList: 'Fred,Bill', status : 'speaker', statusChangedEventHandlers : [ statusChangedEventHandler ] } ) );
            
            fakeRenderer = jasmine.createSpyObj('renderer', ['statusChangedEventHandler', 'add', 'move']);
            fakeRepository = jasmine.createSpyObj('repo', ['statusChangedEventHandler', 'getParticipants']);
            fakeRepository.getParticipants.andReturn(pList);            

            pbp = parkBenchPanel(fakeRepository, fakeRenderer);
            pbp.init();
        });
        
        it("then my status should be set to listener", function() {
            pbp.doneTalkin('Bill');
            expect(pList[3].getStatus()).toEqual('listener');
        });

        describe("given there is a waiting participant", function() {
            beforeEach(function() {pList[0].setStatus('waiting');});
            it("then the waiting participant becomes a speaker", function() {
                pbp.doneTalkin('Bill');
                expect(pList[0].getStatus()).toEqual('speaker');
            });
        });

    });

    describe("when another participant becomes a speaker", function() {
       it("then the pbp should be notified", function() {
           
       });
    });


    describe("when a new participant joins", function() {

        var pbpParticipants, newPbpParticipants;
        
        beforeEach(function() {            
            
            pbpParticipants = getPbpParticipants( { nameList: 'Bob,Fred' } );
            
            fakeRenderer = jasmine.createSpyObj('renderer', ['statusChangedEventHandler', 'add', 'move']);
            fakeRenderer.statusChangedEventHandler = jasmine.createSpy('statusChangedEventHandler');
            
            fakeRepository = jasmine.createSpyObj('repo', ['statusChangedEventHandler', 'getParticipants']);
            fakeRepository.getParticipants.andReturn(pbpParticipants);
        
            pbp = parkBenchPanel(fakeRepository, fakeRenderer);
            pbp.init();
            fakeRenderer.statusChangedEventHandler.reset();
            
            //Act
            newPbpParticipants = getPbpParticipants( { nameList: 'Bill' } );
            pbp.newParticipantsJoined(newPbpParticipants);
        });
        it("then the new participant is added to the park bench panel", function() {
            expect(pbp.getParticipants().length).toEqual(3);
        });
        it("then the status should be set to listener", function() {
            expect(pbp.getParticipants()[2].getStatus()).toEqual('listener');
        });
        it("then the renderer should notified of a new participant event", function() {
            expect(fakeRenderer.statusChangedEventHandler.callCount).toEqual(1);
            expect(fakeRenderer.statusChangedEventHandler.calls[0].args[0].name).toEqual('Bill');
            expect(fakeRenderer.statusChangedEventHandler.calls[0].args[0].currentStatus).toEqual('listener');
            expect(fakeRenderer.statusChangedEventHandler.calls[0].args[0].lastStatus).toBeUndefined();
        });
        
    });

    describe("Integration Event Tests", function() {
        
        describe("Hangout raising events", function() {
            
            var participantEventHandlerSpy;
            var participantAddedEvent;
            var stateChangedHandlerSpy;
            var googleParticipants;
            var stateList = { '2': 'speaker' };
            
            beforeEach(function() {

                googleParticipants = getGoogleParticipants('Bob,Fred');

                participantAddedEvent =  { addedParticipants : [googleParticipants[0]] };

                fakeRenderer = jasmine.createSpyObj('renderer', ['statusChangedEventHandler', 'add', 'move']);

                //Arrange
                fakeGoogleHangout = {
                    isApiReady: jasmine.createSpy('isApiReady').andReturn(true),
                    getParticipants: jasmine.createSpy('getParticipants').andReturn([googleParticipants[1]]),
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
                        getValue: jasmine.createSpy('getValue').andCallFake(function(value) {
                            return stateList[value];
                        }),
                        setValue: jasmine.createSpy('setValue'),
                    },
                    getLocalParticipant : jasmine.createSpy('getLocalParticipant').andReturn(googleParticipants[0]),
                };
                hangout = hangoutWrapper({
                    hangout: fakeGoogleHangout
                });
                pbp = parkBenchPanel(hangout, fakeRenderer);
                pbp.start();
                fakeRenderer.statusChangedEventHandler.reset();

                //Act - hangout raises new participant event 

            });
            
            describe("raising a new participant event", function() {
                
                beforeEach(function() {
                    participantEventHandlerSpy(participantAddedEvent);
                })

                it("then the new participant is added to the park bench panel", function() {
                    expect(pbp.getParticipants().length).toEqual(2);
                });

                it("and the event is passed on to subscribers to the pbp new participant event.", function() {
                    expect(fakeRenderer.statusChangedEventHandler.callCount).toEqual(1);
                    expect(fakeRenderer.statusChangedEventHandler.calls[0].args[0].name).toEqual('Bob');
                    expect(fakeRenderer.statusChangedEventHandler.calls[0].args[0].currentStatus).toEqual('listener');
                    expect(fakeRenderer.statusChangedEventHandler.calls[0].args[0].lastStatus).toBeUndefined();
                });
                            
            });
            
            describe("raising a new state changed event", function() {
                
                beforeEach(function() {
                    stateChangedHandlerSpy({ state : { '2' : 'speaker'} } );
                });

                it("then the status of the participant is updated", function() {
                    expect(pbp.getParticipants()[0].getStatus()).toEqual('speaker');
                });
                
                it("and the event is passed on to subscribers of the pbp participant updated event.", function() {
                    expect(fakeRenderer.statusChangedEventHandler.callCount).toEqual(1);
                    expect(fakeRenderer.statusChangedEventHandler.calls[0].args[0].name).toEqual('Fred');
                });

                            
            });


        });

    });
    });
