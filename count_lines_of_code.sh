#!/bin/bash
echo $(find . -name '*.*' | grep -vE '*.git*|node_modules|bower_components|*.json*|*.png*|*.jpg*|Procfile|npm-debug.log|*.md|*.beefdata|*.db|*.ico|*.PNG')
echo $(find . -name '*.*' | grep -vE '*.git*|node_modules|bower_components|*.json*|*.png*|*.jpg*|Procfile|npm-debug.log|*.md|*.beefdata|*.db|*.ico|*.PNG' | xargs wc -l | tail -1 | sed 's#\ total##g' | sed 's#\ ##g')
