park-bench-panel
================

Google hangout park bench panel app

====

Useful Links
============

* [Cloud 9 Project](http://c9.io/neilbmclaughlin/park-bench-panel)
* [Hangouts console](https://code.google.com/apis/console/b/0/#project:727799527310)
* [Start page](http://htmlpreview.github.com/?https://raw.github.com/neilbmclaughlin/park-bench-panel/master/start.html)
* [Hello World App](https://hangoutsapi.talkgadget.google.com/hangouts?authuser=0&gid=857952554289)

Tests
=====

* [Run qUnit dev tests from github](http://htmlpreview.github.com/?https://raw.github.com/neilbmclaughlin/park-bench-panel/master/Tests/park-bench-panel-tests-dev.html)
* [Run qUnit int tests from github](http://htmlpreview.github.com/?https://raw.github.com/neilbmclaughlin/park-bench-panel/master/Tests/park-bench-panel-tests-int.html)
 
Notes
=====

* Running the script generate.xml will create an xml file suitable for use as a google hangout app definition. This is run from a pre-commit hook (see below).
* Needed to create a symbolic link to pre-comit script (eg ln -s ~/373312/pre-commit.sh .git/hooks/pre-commit) 
* Hangout xml parser seems to need closing tags for html elements (ie `<script></script>` rather than `<script ... />`)