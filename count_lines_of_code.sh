#!/bin/bash

echo $(find . -name '*.*' | grep -vE '*.git*|node_modules|bower_components|*.json*|*.png*|*.jpg*|Procfile|npm-debug.log|*.md' | xargs wc -l | tail -1 | sed 's#\ total##g' | sed 's#\ ##g')