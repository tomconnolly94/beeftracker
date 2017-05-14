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

#generate json format for targets object - ################################
targets_string='['
count=0

for i in "${targets[@]}"
do
    targets_string="$targets_string "$i
    new_count=$((count+1))
    if [ ${#targets[@]} -eq $new_count ] ; then
        targets_string="$targets_string"
    else
        targets_string="$targets_string ,"
    fi
    count=$((count+1))
done

targets_string="$targets_string ] "

#echo $targets_string

#generate json format for highlights object - ################################
highlights_string='{ '
count=0

for i in "${highlights[@]}"
do
    #split record to extract title which will be the first value in the array
    IFS="#" read -a highlight_breakdown <<< "$i"
    internal_count=0
    #declare string to hold json format
    highlight_string='"'${highlight_breakdown[0]}'" : ['
    
    unset highlight_breakdown[0]
    
    for j in "${highlight_breakdown[@]}"
    do
        highlight_string="$highlight_string \"$j\""
        
        new_internal_count=$((internal_count+1))
        
        if [ ${#highlight_breakdown[@]} -eq $new_internal_count ] ; then
            highlight_string="$highlight_string"
        else
            highlight_string="$highlight_string,"
        fi
        internal_count=$((internal_count+1))
    done
    
    highlight_string="$highlight_string ] "
    
    highlights_string="$highlights_string $highlight_string"
    new_count=$((count+1))
    if [ ${#highlights[@]} -eq $new_count ] ; then
        highlights_string="$highlights_string"
    else
        highlights_string="$highlights_string,"
    fi
    count=$((count+1))
done

highlights_string="$highlights_string }"

echo $highlights_string

#generate json format for data_sources object - ################################
data_sources_string='['
count=0

for i in "${data_sources[@]}"
do
    data_sources_string="$data_sources_string \"$i\""
    new_count=$((count+1))
    if [ ${#data_sources[@]} -eq $new_count ] ; then
        data_sources_string="$data_sources_string"
    else
        data_sources_string="$data_sources_string ,"
    fi
    count=$((count+1))
done

data_sources_string="$data_sources_string ] "

#echo $data_sources_string

#generate json format for links object - ################################
links_string='{ mf_video_link : "'${data[6]}'", mf_img_link : "'${data[7]}'", '
count=0

for i in "${variable_links[@]}"
do
    IFS="#" read -a name_url_pair <<< "$i"

    links_string="$links_string \"${name_url_pair[0]}\" : \"${name_url_pair[1]}\""
    new_count=$((count+1))
    if [ ${#variable_links[@]} -eq $new_count ] ; then
        links_string="$links_string"
    else
        links_string="$links_string ,"
    fi
    count=$((count+1))
done

links_string="$links_string }"

#echo $links_string

insert_cmd='db.event_data_v0_2.update( 
{ 
    "title" : '\"${data[0]}\"' 
}, 
{ 
    "title" : '\"${data[0]}\"', 
    "aggressor" : '${data[1]}',
    "targets" : '$targets_string',
    "description" : '\"${data[3]}\"', 
    "date_added" : new Date(),
    "event_date" : '${data[4]}',
    "highlights" : '$highlights_string',
    "data_sources" : '$data_sources_string', 
    "links" : '$links_string'
},
{ 
    upsert : true 
}
);'

echo $insert_cmd;

mongo ds141937.mlab.com:41937/heroku_w63fjrg6 -u tom -p tom --eval "$insert_cmd"