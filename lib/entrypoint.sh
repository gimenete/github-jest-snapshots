#!/bin/sh

set -e

pwd
echo "looking at package.json"
cat package.json
npm install

NODE_PATH=node_modules node /action/lib/run.js
