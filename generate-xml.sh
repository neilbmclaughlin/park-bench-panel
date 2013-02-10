sed -e '/PBP SCRIPT BLOCK START/r script-fragment-int.html' park-bench-panel-template.html > park-bench-panel.html
sed -e '/CDATA/r park-bench-panel.html' park-bench-panel-template.xml >  park-bench-panel-int.xml                                                                                         

sed -e '/PBP SCRIPT BLOCK START/r script-fragment-dev.html' park-bench-panel-template.html > park-bench-panel.html
sed -e '/CDATA/r park-bench-panel.html' park-bench-panel-template.xml >  park-bench-panel-dev.xml                                                                                         