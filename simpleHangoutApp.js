function showParticipants_old() {
  var participants = gapi.hangout.getParticipants();

  var retVal = '<p>Participants: </p><ul>';

  for (var index in participants) {
    var participant = participants[index];

    if (!participant.person) {
      retVal += '<li>A participant not running this app</li>';
    }
    retVal += '<li>' + participant.person.displayName + '</li>';
  }

  retVal += '</ul>';

  var div = document.getElementById('participants');

  div.innerHTML = retVal;
}

function showParticipants() {
  var items=[];
  var participants = gapi.hangout.getParticipants();

  $(participants).each(function(index, Element) {
      items.push($('<li/>').text(Element.person.displayName));
  });
  $('#participantList').append.apply($('#participantList'), items);
  
  $( "#participantList li" ).draggable({
    appendTo: "body",
    helper: "clone"
  });
  
  $( "#speakerList" ).droppable({
    activeClass: "ui-state-default",
    hoverClass: "ui-state-hover",
    drop: function( event, ui ) {
        $( this ).find( ".speakerPlaceholder" ).remove();
        $( "<li></li>" ).text( ui.draggable.text() ).appendTo( this );
    }
})
  
}

function init() {
  gapi.hangout.onApiReady.add(
      function(eventObj) {
        if (eventObj.isApiReady) {
          document.getElementById('showParticipants')
            .style.visibility = 'visible';
        }
      });
}

gadgets.util.registerOnLoadHandler(init);
