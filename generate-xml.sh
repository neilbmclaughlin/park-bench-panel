awk 'BEGIN {
  print "<?xml version=\"1.0\" encoding=\"UTF-8\" ?>"
  print "<Module>"
  print "  <ModulePrefs title=\"Hangout Starter\">"
  print "    <Require feature=\"rpc\" />"
  print "    <Require feature=\"views\" />"
  print "    <Require feature=\"locked-domain\" />"
  print "  </ModulePrefs>"
  print "  <Content type=\"html\"><![CDATA[ "}
    { print $0 }
END {print "]]></Module>"}'  park-bench-panel.html >  park-bench-panel.xml
