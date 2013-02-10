$(document).ready(function() {
    var hangout = new hangoutWrapper();    
    var pbp = new parkBenchPanel(hangout);
    if (hangout.isHangoutApiReady()) {
        console.log("Yes it was ready. We can start.");
        pbp.init();
    }
    else {
        console.log("No - not read yet. We have to listen.");
        hangout.addOnApiReadyCallback(pbp.init);
    }
});
