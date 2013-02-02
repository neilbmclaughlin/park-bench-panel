park-bench-panel
================

Google hangout park bench panel app

====

Useful Links
============

* [Hangouts console](https://code.google.com/apis/console/b/0/#project:727799527310)
* [This github repo](https://github.com/neilbmclaughlin/park-bench-panel)
* [Cloud 9 Project](http://c9.io/neilbmclaughlin/park-bench-panel)
* [Demo app walkthrough](http://life.scarygami.net/hangoutapps/)

Tests
=====

* [Run qUnit dev tests from github](http://htmlpreview.github.com/?https://raw.github.com/neilbmclaughlin/park-bench-panel/master/park-bench-panel-tests-dev.html)
* [Run qUnit int tests from github](http://htmlpreview.github.com/?https://raw.github.com/neilbmclaughlin/park-bench-panel/master/park-bench-panel-tests-int.html)
 
Notes
=====

* Needed to create a symbolic link to pre-comit script (eg ln -s ~/373312/pre-commit.sh .git/hooks/pre-commit) 
* Hangout xml parser seems to need closing tags for html elements (ie `<script></script>` rather than `<script ... />`)