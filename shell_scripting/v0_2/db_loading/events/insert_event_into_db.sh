#!/bin/bash

counter=0
declare -a lyrics
declare -a targets

while read line; do
    
    if [ $counter -eq 2 ]
	then
        IFS="|" read -a targets <<< "$line"
	fi
    if [ $counter -eq 5 ]
	then
        IFS="|" read -a highlights <<< "$line"
	fi
	if [ $counter -eq 8 ]
	then
        IFS="|" read -a data_sources <<< "$line"
	fi
	if [ $counter -eq 9 ]
	then
        IFS="|" read -a variable_links <<< "$line"
	fi

    data[$counter]=$line

    counter=$((counter+1))

done < "$1"

count_command='db.event_data_v0_1.count( { } )'

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

links_string='{ links : { mf_video_link : ${data[6]}, mf_img_link : ${data[7]}, '
count=0

for i in "${variable_links[@]}"
do
    IFS="#" read -a name_url_pair <<< "$i"

    links_string="$lyrics_string \"${name_url_pair[0]}\" : \"${name_url_pair[1]}\""
    new_count=$((count+1))
    if [ ${#variable_links[@]} -eq $new_count ] ; then
        links_string="$links_string"
    else
        links_string="$links_string ,"
    fi
    count=$((count+1))
done

links_string="$links_string } } "

insert_cmd='db.event_data_v0_1.update( 
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
    "links" : '\"${data[5]}\"', 
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

#mongo ds141937.mlab.com:41937/heroku_w63fjrg6 -u tom -p tom --eval "$insert_cmd"