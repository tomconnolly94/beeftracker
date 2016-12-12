#!/bin/bash

counter=0

while read line; do

	if [ $counter -eq 8 ]
	then
		lyric_counter=0
		while IFS=',' read -r lyric || [[ -n "$lyric" ]]; do
			lyrics[lyric_counter]=$lyric
		done < $line

	fi

    data[$counter]=$line


    echo ${data[$counter]}

    counter=$((counter+1))

done < "$1"

title=${data[0]}
aggressor==${data[1]}
targets=${data[0]}
description==${data[3]}
date_added=${data[4]}
img_link==${data[5]}
url=${data[6]}
event_date==${data[7]}

event_count=$( mongo ds141937.mlab.com:41937/heroku_w63fjrg6 -u tom -p tom --eval db.event_data.count( { } );)

to_string="${data[0]} ${data[1]}"

echo $to_string

title=$(echo "$title")

insert_cmd='db.event_data.insert( { "title" : $title } );' 

#, "aggressor" : "${data[1]}", "description" : "${data[3]}", "date_added" : "${data[4]}", "image_link" : "${data[5]}", "url" : "${data[6]}", "event_date" : "${data[7]}", "event_id" : "$event_count", "to_string" : "$to_string" } );'

mongo ds141937.mlab.com:41937/heroku_w63fjrg6 -u tom -p tom --eval "$insert_cmd"

#mongo ds141937.mlab.com:41937/heroku_w63fjrg6 -u tom -p tom --eval 'db.event_data.update ( { "event_id" : "$event_count" }, { $set : { }});'