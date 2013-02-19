#!/bin/sh

#sed -e '/PBP SCRIPT BLOCK START/r script-fragment-dummy.html' park-bench-panel-template.html > Tests/park-bench-panel-dummy.html

sed -e '/PBP SCRIPT BLOCK START/r script-fragment-int.html' park-bench-panel-template.html > park-bench-panel.html
sed -e '/CDATA/r park-bench-panel.html' park-bench-panel-template.xml >  park-bench-panel-int.xml                                                                                         
sed -e '/PBP SCRIPT BLOCK START/r Tests/script-fragment-test-int.html' Tests/park-bench-panel-tests-template.html > Tests/park-bench-panel-tests-int.html

sed -e '/PBP SCRIPT BLOCK START/r script-fragment-dev.html' park-bench-panel-template.html > park-bench-panel.html
sed -e '/CDATA/r park-bench-panel.html' park-bench-panel-template.xml >  park-bench-panel-dev.xml
sed -e '/PBP SCRIPT BLOCK START/r Tests/script-fragment-test-dev.html' Tests/park-bench-panel-tests-template.html > Tests/park-bench-panel-tests-dev.html
