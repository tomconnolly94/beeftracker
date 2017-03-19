#!/bin/bash

counter=0
#declare arrays
declare -a nicknames
declare -a occupations
declare -a achievements
declare -a data_sources
declare -a associated_actors

while read line; do

    if [ $counter -eq 2 ]
	then
        IFS="|" read -a nicknames <<< "$line"
	fi
    
    if [ $counter -eq 4 ]
	then
        IFS="|" read -a occupations <<< "$line"
	fi
    
    if [ $counter -eq 6 ]
	then
        IFS="|" read -a achievememts <<< "$line"
	fi
    
    if [ $counter -eq 11 ]
	then
        IFS="|" read -a data_sources <<< "$line"
	fi
    
    if [ $counter -eq 12 ]
	then
        IFS="|" read -a associated_actors <<< "$line"
	fi

    data[$counter]=$line
    
    echo $line
    echo $counter

    counter=$((counter+1))

done < "$1"

echo ${data[4]}

insert_cmd='db.artist_data_v0_1.insert( { 
"stage_name" : '\"${data[0]}\"', 
"birth_name" : '\"${data[1]}\"',
"nicknames" : '$nicknames',
"d_o_b" : '${data[3]}',
"occupations" : '$occupations',
"origin" : '\"${data[5]}\"',
"acheivements" : '$achievements',
"bio" : '\"${data[7]}\"',
"youtube_link" : '\"${data[8]}\"',
"wiki_page" : '\"${data[9]}\"',
"spotify_link" : '\"${data[10]}\"',
"data_sources" : '$data_sources',
"associated_actors" : '$associated_actors',
"loc_img_link" : '\"${data[13]}\"',
} );'

echo $insert_cmd;

mongo ds141937.mlab.com:41937/heroku_w63fjrg6 -u tom -p tom --eval "$insert_cmd"