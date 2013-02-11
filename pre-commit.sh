#!/bin/sh

./generate-xml.sh
git add .

#
#if [[ ! -a ./park-bench-panel.html ]] 
#then
#  echo "Error: park-bench-panel.html must exist"
#  exit 1
#fi
#
#git diff --cached --quiet ./park-bench-panel.html
#
#STATUS=$?
#
#if [[ $STATUS -eq 1 ]]
#then
#  ./generate-xml.sh
#  git add ./park-bench-panel.xml
#  echo "park-bench-panel.xml was regenerated."
#else
#  echo "park-bench-panel.xml is up to date."
#fi
#
