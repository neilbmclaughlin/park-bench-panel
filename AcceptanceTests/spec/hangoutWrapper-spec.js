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
                var googleParticipants = getGoogleParticipants('Bob');
                fakeGoogleHangout = {
                    isApiReady : jasmine.createSpy('isApiReady').andReturn(true),
                    onParticipantsAdded : { add : jasmine.createSpy('onParticipantsAdded.add') },
                    onParticipantsRemoved : { add : jasmine.createSpy('onParticipantsRemoved.add') },
                    data : { 
                        onStateChanged : { add : jasmine.createSpy('onStateChanged.add') }
                    },
                    getLocalParticipant : jasmine.createSpy('getLocalParticipant').andReturn(googleParticipants[0]),
                };
                hangout = hangoutWrapper({ hangout : fakeGoogleHangout });
                hangout.start(newParticipantsJoinedHandler, stateChangedHandler, init);
            });
            
            it("then the event handler for handling new participants should be wired in", function() {
                expect(fakeGoogleHangout.onParticipantsAdded.add).toHaveBeenCalled(); //Not easy to assert calledWith       
            }); 
            it("then the event handler for handling participants leaving should be wired in", function() {
                expect(fakeGoogleHangout.onParticipantsRemoved.add).toHaveBeenCalled(); //Not easy to assert calledWith       
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
                var googleParticipants = getGoogleParticipants('Bob');
                fakeGoogleHangout = {
                    isApiReady : jasmine.createSpy('isApiReady').andReturn(false),
                    onApiReady : { add : jasmine.createSpy('onApiReady.add') } ,                
                    getLocalParticipant : jasmine.createSpy('getLocalParticipant').andReturn(googleParticipants[0]),
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
