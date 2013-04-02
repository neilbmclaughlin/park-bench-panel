// var hangoutWrapper = function(gapi) {
// 
//     var addOnNewParticipantCallback = function(f) {
//         gapi.hangout.onParticipantsAdded.add(f);
//     };
// 
//     var addOnStateChangedCallback = function(f) {
//         gapi.hangout.data.onStateChanged.add(f);
//     };
// 
//     var isHangoutApiReady = function() {
//         return gapi.hangout.isApiReady();
//     };
// 
//     var addOnApiReadyCallback = function(f) {
//         gapi.hangout.onApiReady.add(f);
//     };
// 
//     var setup = function(newParticipantJoined, stateChanged, init) {
//         addOnNewParticipantCallback(newParticipantJoined);
//         addOnStateChangedCallback(stateChanged);
//         init();
//     };
// 
//     return {
//         start: function(newParticipantJoined, stateChanged, init) {
//             if (isHangoutApiReady()) {
//                 setup();
//             }
//             else {
//                 addOnApiReadyCallback(setup);
//             }
//         },
// 
//         getParticipants: function() {
//             return gapi.hangout.getParticipants();
// 
//         },
//         getLocalParticipant: function() {
//             return gapi.hangout.getLocalParticipant();
//         },
//         setParticipantStatus: function(participantStatusHistories) {
//             var delta = {};
//             for (p in participantStatusHistories) {
//                 delta[p] = participantStatusHistories[p].join(",");
//             }
//             return gapi.hangout.data.submitDelta(delta);
//         },
//         clearParticipantStatus: function(participantId) {
//             return gapi.hangout.data.clearValue(participantId);
//         },
//         displayNotice: function(message) {
//             gapi.hangout.layout.displayNotice(message);
//         },
//     };
// };