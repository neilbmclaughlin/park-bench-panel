$(document).ready(function() {
    var hangout = new hangoutWrapper();    
    var pbp = parkBenchPanel(hangout);
    if (isHangoutApiReady()) {
        console.log("Yes it was ready. We can start.");
        pbp.init();
    }
    else {
        console.log("No - not read yet. We have to listen.");
        pbp.addOnApiReadyCallback(init);
    }
});
