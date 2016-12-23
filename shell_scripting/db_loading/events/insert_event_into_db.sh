#!/bin/bash

counter=0
declare -a lyrics
declare -a targets

while read line; do

	if [ $counter -eq 7 ]
	then
        IFS="|" read -a lyrics <<< "$line"
	fi
    if [ $counter -eq 2 ]
	then
        IFS="|" read -a targets <<< "$line"
	fi

    data[$counter]=$line

    counter=$((counter+1))

done < "$1"

count_command='db.event_data.count( { } )'

event_count=$( mongo ds141937.mlab.com:41937/heroku_w63fjrg6 -u tom -p tom --eval "$count_command";)
event_count="${event_count:$length-1}" # take the last char off the end of the response
event_count="$(($event_count + 1))" #add one to get the next event_id
to_string="${data[0]} ${data[1]}" #concat to string data

targets_string='{ '
count=0

for i in "${targets[@]}"
do
    targets_string="$targets_string \"$count\" : \"$i\""
    new_count=$((count+1))
    if [ ${#targets[@]} -eq $new_count ] ; then
        targets_string="$targets_string"
    else
        targets_string="$targets_string ,"
    fi
    count=$((count+1))
done

targets_string="$targets_string } "

lyrics_string=' { '
count=0

for i in "${lyrics[@]}"
do
    lyrics_string="$lyrics_string \"$count\" : \"$i\""
    new_count=$((count+1))
    if [ ${#lyrics[@]} -eq $new_count ] ; then
        lyrics_string="$lyrics_string"
    else
        lyrics_string="$lyrics_string ,"
    fi
    count=$((count+1))
done

lyrics_string="$lyrics_string } "

insert_cmd='db.event_data.update( 
{ 
    "title" : '\"${data[0]}\"' 
}, 
{ 
    "title" : '\"${data[0]}\"', 
    "aggressor" : '\"${data[1]}\"',
    "targets" : '$targets_string',
    "description" : '\"${data[3]}\"', 
    "date_added" : new Date(), 
    "image_link" : '\"${data[4]}\"', 
    "url" : '\"${data[5]}\"', 
    "event_date" : '${data[6]}', 
    "event_id" : '\"$event_count\"',
    "top_lyrics" :'$lyrics_string',
    "to_string" : '\"$to_string\"' 
},
{ 
    upsert : true 
}
);'

echo $insert_cmd;

mongo ds141937.mlab.com:41937/heroku_w63fjrg6 -u tom -p tom --eval "$insert_cmd"