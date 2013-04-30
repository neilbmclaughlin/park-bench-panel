var getPbpParticipants = function(spec) {
    
    var googleParticipants = getGoogleParticipants(spec.namelist);
    var fakeHangout = {
        setStatus:  jasmine.createSpy('setStatus'),
        getStatus:  jasmine.createSpy('getStatus').andReturn('listener'),
    };
    var mapper = participantMapper(fakeHangout, spec.localParticipantId);

    var pList = $.map(googleParticipants, mapper);
                        
    $.each(pList, function(i, p) {
        if (p.getId() != spec.localParticipantId) {
            p.setStatus(spec.status);
        }
    });
    pList[spec.localParticipantId - 1].setStatus(spec.localParticipantStatus);
    fakeHangout.setStatus.reset();
    fakeHangout.getStatus.reset();
    
    return { pList : pList, fakeHangout: fakeHangout};
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
