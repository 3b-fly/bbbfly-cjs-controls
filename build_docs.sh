#!/bin/bash

cd .
node node_modules/.bin/grunt docs

read -n 1 -s -r -p "Press any key to continue . . ."