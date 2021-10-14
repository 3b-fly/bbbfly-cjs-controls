#!/bin/bash

cd .
jsdoc -c build.json --verbose

read -n 1 -s -r -p "Press any key to continue . . ."