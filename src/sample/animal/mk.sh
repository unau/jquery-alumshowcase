#!/bin/bash

mkdir -p ../../../out/sample/animal
awk -f ./mkdata.awk ./animals.txt
install -t ../../../out/sample/animal ./index.html ./animals.json ./page.json ./animals.css ./animals.js

# end of file
