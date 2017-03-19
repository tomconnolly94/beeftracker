#!/bin/bash

counter=0

while read line; do

    data[$counter]=$line
    
    echo $line
    echo $counter

    counter=$((counter+1))

done < "$1"

count_command='db.artist_data_v0_1.count( { } )'

event_count=$( mongo ds141937.mlab.com:41937/heroku_w63fjrg6 -u tom -p tom --eval "$count_command";)
event_count="${event_count:$length-1}" # take the last char off the end of the response
event_count="$(($event_count + 1))" #add one to get the next artist_id

echo ${data[4]}

insert_cmd='db.artist_data_v0_1.insert( { 
"stage_name" : '\"${data[0]}\"', 
"birth_name" : '\"${data[1]}\"',
"d_o_b" : '${data[2]}',
"img_link" : '\"${data[3]}\"', 
"artist_id" : '\"$event_count\"', 
"bio" : '\"${data[4]}\"'
} );'

echo $insert_cmd;

mongo ds141937.mlab.com:41937/heroku_w63fjrg6 -u tom -p tom --eval "$insert_cmd"