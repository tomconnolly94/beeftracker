#!/bin/bash

cmd='db.event_data.count( {});'

echo "CMD: $cmd"

event_count=$(mongo ds141937.mlab.com:41937/heroku_w63fjrg6 -u tom -p tom --eval "$cmd")

echo "\n";
echo $event_count;