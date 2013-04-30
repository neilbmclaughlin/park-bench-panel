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

        var pList = [],
            fakeHangout, localParticipantId = 2;

        beforeEach(function() {

            var result = getPbpParticipants({
                namelist: 'Bob,Fred,Bill',
                status: 'listener',
                localParticipantId: localParticipantId,
                localParticipantStatus: undefined
            });
            pList = result.pList;
            fakeHangout = result.fakeHangout;

            fakeRepository = jasmine.createSpyObj('repo', ['statusChangedEventHandler', 'getLocalParticipant', 'getParticipants']);
            fakeRepository.getParticipants.andReturn(pList);
            fakeRepository.getLocalParticipant.andReturn(pList[localParticipantId - 1]);

            fakeRenderer = jasmine.createSpyObj('renderer', ['statusChangedEventHandler', 'add', 'move']);
            fakeRenderer.statusChangedEventHandler = jasmine.createSpy('rendererStatusChangedEventHandler');


            pbp = parkBenchPanel(fakeRepository, fakeRenderer);

            fakeRenderer.statusChangedEventHandler.reset();

            //Act
            pbp.init();

        });

        it("then status of only the local participant should be initialised to 'listener'", function() {
            expect(fakeHangout.setStatus.callCount).toEqual(1);
            expect(fakeHangout.setStatus.calls[0].args[0]).toEqual(pList[localParticipantId - 1].getId());
            expect(fakeHangout.setStatus.calls[0].args[1]).toEqual('listener');
        });
        it("then the renderer should have been instructed to add all participants", function() {
            expect(fakeRenderer.statusChangedEventHandler.callCount).toEqual(3);
        });
    });

    describe("when I am a listener and I request to speak", function() {

        describe("given there are currently no speakers", function() {

            var pList = [],
                statusChangedEventHandler, localParticipantId = 3,
                fakeGoogleApi;

            beforeEach(function() {

                //Arrange
                var result = getPbpParticipants({
                    namelist: 'Bob,Fred,Bill',
                    status: 'listener',
                    localParticipantId: localParticipantId,
                    localParticipantStatus: 'listener'

                });
                pList = result.pList;
                fakeHangout = result.fakeHangout;

                fakeRenderer = jasmine.createSpyObj('renderer', ['statusChangedEventHandler', 'add', 'move']);
                fakeRepository = jasmine.createSpyObj('repo', ['statusChangedEventHandler', 'getLocalParticipant', 'getParticipants']);
                fakeRepository.getParticipants.andReturn(pList);
                fakeRepository.getLocalParticipant.andReturn(pList[localParticipantId - 1]);


                pbp = parkBenchPanel(fakeRepository, fakeRenderer);
                pbp.init();
                fakeRenderer.statusChangedEventHandler.reset();

                //Act
                pbp.gotSomethingToSay('Bill');
            });

            it("then my status should be set to speaker", function() {
                expect(pList[localParticipantId - 1].getStatus()).toEqual('speaker');
                expect(fakeHangout.setStatus.callCount).toEqual(1);
                expect(fakeHangout.setStatus.calls[0].args[0]).toEqual(pList[localParticipantId - 1].getId());
                expect(fakeHangout.setStatus.calls[0].args[1]).toEqual('speaker');
            });
            it("then the renderer should have been instructed update my status", function() {
                expect(fakeRenderer.statusChangedEventHandler.callCount).toEqual(1);
                expect(fakeRenderer.statusChangedEventHandler).toHaveBeenCalledWith({
                    participant: pList[localParticipantId - 1],
                    lastStatus: 'listener',
                });
            });
        });

        describe("given there are currently 3 speakers and the local participant wants to talk", function() {

            var pList = [],
                fakeGoogleApi, localParticipantId = 4;

            beforeEach(function() {

                //Arrange
                var result = getPbpParticipants({
                    namelist: 'Bob,Fred,Bill,Joe',
                    status: 'speaker',
                    localParticipantId: localParticipantId,
                    localParticipantStatus: 'listener'

                });
                pList = result.pList;

                fakeRenderer = jasmine.createSpyObj('renderer', ['statusChangedEventHandler', 'add', 'move']);
                fakeRepository = jasmine.createSpyObj('repo', ['statusChangedEventHandler', 'getLocalParticipant', 'getParticipants']);
                fakeRepository.getParticipants.andReturn(pList);
                fakeRepository.getLocalParticipant.andReturn(pList[localParticipantId - 1]);

                pbp = parkBenchPanel(fakeRepository, fakeRenderer);
                pbp.init();
                fakeRenderer.statusChangedEventHandler.reset();


                //Act
                pbp.gotSomethingToSay('Joe'); //Todo: use getlocalparticipant rather than pass name in
            });
            it("then the listener status should be set to waiting", function() {
                expect(pList[localParticipantId - 1].getStatus()).toEqual('waiting');
            });
            it("then the renderer should update the display", function() {
                expect(fakeRenderer.statusChangedEventHandler.callCount).toEqual(1);
                expect(fakeRenderer.statusChangedEventHandler).toHaveBeenCalledWith({
                    participant: pList[localParticipantId - 1],
                    lastStatus: 'listener',
                });
            });
        });

    });

    describe("when I am a speaker and I request to stop speaking", function() {

        var pList = [],
            fakeGoogleApi, localParticipantId = 3;

        beforeEach(function() {

            //Arrange
            var result = getPbpParticipants({
                namelist: 'Bob,Fred,Bill',
                status: 'speaker',
                localParticipantId: localParticipantId,
                localParticipantStatus: 'speaker'

            });
            pList = result.pList;
            fakeGoogleApi = result.fakeGoogleApi;

            fakeRenderer = jasmine.createSpyObj('renderer', ['statusChangedEventHandler', 'add', 'move']);
            fakeRepository = jasmine.createSpyObj('repo', ['statusChangedEventHandler', 'getLocalParticipant', 'getParticipants']);
            fakeRepository.getParticipants.andReturn(pList);
            fakeRepository.getLocalParticipant.andReturn(pList[localParticipantId - 1]);

            pbp = parkBenchPanel(fakeRepository, fakeRenderer);
            pbp.init();
            fakeRenderer.statusChangedEventHandler.reset();
        });

        it("then my status should be set to listener", function() {
            pbp.doneTalkin('Bill');
            expect(pList[localParticipantId - 1].getStatus()).toEqual('listener');
        });

        describe("given there is a waiting participant", function() {
            beforeEach(function() {
                pList[0].setStatus('waiting');
            });
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

        var pList, newPbpParticipants, fakeHangout, localParticipantId = 2;

        beforeEach(function() {

            //Arrange
            var result = getPbpParticipants({
                namelist: 'Bob,Fred,Bill',
                status: 'listener',
                localParticipantId: localParticipantId,
                localParticipantStatus: 'listener'

            });
            pList = result.pList.slice(0, 2);

            fakeRenderer = jasmine.createSpyObj('renderer', ['statusChangedEventHandler', 'add', 'move']);
            fakeRepository = jasmine.createSpyObj('repo', ['statusChangedEventHandler', 'getLocalParticipant', 'getParticipants']);
            fakeRepository.getParticipants.andReturn(pList);
            fakeRepository.getLocalParticipant.andReturn(pList[localParticipantId - 1]);

            pbp = parkBenchPanel(fakeRepository, fakeRenderer);
            pbp.init();
            fakeRenderer.statusChangedEventHandler.reset();

            //Act
            newPbpParticipants = result.pList.slice(2, 3);
            newPbpParticipants[0].setStatus(undefined);
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
            expect(fakeRenderer.statusChangedEventHandler.calls[0].args[0].participant.getName()).toEqual('Bill');
            expect(fakeRenderer.statusChangedEventHandler.calls[0].args[0].participant.getStatus()).toEqual('listener');
            expect(fakeRenderer.statusChangedEventHandler.calls[0].args[0].lastStatus).toBeUndefined();
        });

    });

    describe("when a participant leaves", function() {

        var pList, fakeHangout, localParticipantId = 3;

        beforeEach(function() {

            //Arrange
            var result = getPbpParticipants({
                namelist: 'Bob,Fred,Bill',
                status: 'listener',
                localParticipantId: localParticipantId,
                localParticipantStatus: 'listener'

            });
            pList = result.pList;
            fakeHangout = result.fakeHangout;

            fakeRenderer = jasmine.createSpyObj('renderer', ['statusChangedEventHandler', 'add', 'move']);
            fakeRepository = jasmine.createSpyObj('repo', ['statusChangedEventHandler', 'getLocalParticipant', 'getParticipants']);
            fakeRepository.getParticipants.andReturn(pList);
            fakeRepository.getLocalParticipant.andReturn(pList[localParticipantId - 1]);

            pbp = parkBenchPanel(fakeRepository, fakeRenderer);
            pbp.init();
            fakeRenderer.statusChangedEventHandler.reset();

            //Act
            pbp.participantLeaves(pList[localParticipantId - 1]);
        });

        it("then the participant is removed from the park bench panel", function() {
            expect(pbp.getParticipants().length).toEqual(2);
        });
        it("then subscribers should be notified", function() {
            expect(fakeHangout.setStatus.callCount).toEqual(1);
            expect(fakeHangout.setStatus.calls[0].args[0]).toEqual(pList[localParticipantId - 1].getId());
            expect(fakeHangout.setStatus.calls[0].args[1]).toBeUndefined();
        });
        it("then the renderer should notified of a new participant event", function() {
            expect(fakeRenderer.statusChangedEventHandler.callCount).toEqual(1);
            expect(fakeRenderer.statusChangedEventHandler.calls[0].args[0].participant.getName()).toEqual('Bill');
            expect(fakeRenderer.statusChangedEventHandler.calls[0].args[0].participant.getStatus()).toBeUndefined();
            expect(fakeRenderer.statusChangedEventHandler.calls[0].args[0].lastStatus).toEqual('listener');
        });

    });

    describe("Integration Event Tests", function() {

        describe("Hangout raising events", function() {

            var participantEventHandlerSpy;
            var participantAddedEvent;
            var stateChangedHandlerSpy;
            var googleParticipants;
            var stateList = {
                '2': 'listener'
            };

            beforeEach(function() {

                googleParticipants = getGoogleParticipants('Bob,Fred');

                participantAddedEvent = {
                    addedParticipants: [googleParticipants[0]]
                };

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
                    getLocalParticipant: jasmine.createSpy('getLocalParticipant').andReturn(googleParticipants[0]),
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
                });

                it("then the new participant is added to the park bench panel", function() {
                    expect(pbp.getParticipants().length).toEqual(2);
                });

                it("and the event is passed on to subscribers to the pbp new participant event.", function() {
                    expect(fakeRenderer.statusChangedEventHandler.callCount).toEqual(1);
                    expect(fakeRenderer.statusChangedEventHandler.calls[0].args[0].participant.getName()).toEqual('Bob');
                    expect(fakeRenderer.statusChangedEventHandler.calls[0].args[0].participant.getStatus()).toEqual('listener');
                    expect(fakeRenderer.statusChangedEventHandler.calls[0].args[0].lastStatus).toBeUndefined();
                });

            });

            describe("raising a new state changed event", function() {

                beforeEach(function() {
                    stateChangedHandlerSpy({
                        state: {
                            '2': 'speaker'
                        }
                    });
                });

                it("then the status of the participant is updated", function() {
                    expect(pbp.getParticipants()[0].getStatus()).toEqual('speaker');
                });

                it("and the event is passed on to subscribers of the pbp participant updated event.", function() {
                    expect(fakeRenderer.statusChangedEventHandler.callCount).toEqual(1);
                    expect(fakeRenderer.statusChangedEventHandler.calls[0].args[0].participant.getName()).toEqual('Fred');
                });


            });


        });

    });
});
