#!/bin/bash

cd .
jsdoc -c docs_build.json --verbose

read -n 1 -s -r -p "Press any key to continue . . ."