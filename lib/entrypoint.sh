#!/bin/sh

set -e

cd /action/lib
pwd
echo "looking at package.json"
cat package.json
npm install

cd /github/workspace

NODE_PATH=/action/lib/node_modules node /action/lib/run.js
