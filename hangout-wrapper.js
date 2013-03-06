function hangoutWrapper() {
    
    this.getParticipants = function() {
        var participants = gapi.hangout.getParticipants();
        var participantState = gapi.hangout.data.getState();
        console.log("getParticipants")

        $(participants).each(function(index, Element) {
            console.log(Element.id);
            console.log(participantState[Element.id]);
            Element.statusHistory = 
              participantState[Element.id] != null ? participantState[Element.id].split(",") : [ 'listener' ];
        });

        return participants;
    }

    this.isHangoutApiReady = function() {
        return gapi.hangout.isApiReady();
    }

    this.addOnApiReadyCallback = function(f) {
        gapi.hangout.onApiReady.add(f);
    }

    this.getLocalParticipant = function() {
        return gapi.hangout.getLocalParticipant();
    }

    this.addOnNewParticipantCallback = function(f) {
        gapi.hangout.onParticipantsAdded.add(f);
    }

    this.addOnStateChangedCallback = function(f) {
        gapi.hangout.data.onStateChanged.add(f);
    }

    this.setParticipantStatus = function(participantStatusHistories) {
        var delta = {};
        for(p in participantStatusHistories) {
            delta[p] = participantStatusHistories[p].join(",");
        }
        return gapi.hangout.data.submitDelta(delta);
    }

    this.clearParticipantStatus = function(participantId) {
        return gapi.hangout.data.clearValue(participantId);
    }
    
    this.displayNotice = function(message) {
        gapi.hangout.layout.displayNotice(message);
    }


}