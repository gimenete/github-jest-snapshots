#!/bin/sh

set -e

cd /action/lib
npm install

cd /github/workspace

NODE_PATH=/action/lib/node_modules node /action/lib/run.js
