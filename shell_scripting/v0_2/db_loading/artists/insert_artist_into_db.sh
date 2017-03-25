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
        IFS="|" read -a achievements <<< "$line"
	fi
    
    if [ $counter -eq 9 ]
	then
        IFS="|" read -a variable_links <<< "$line"
	fi
    
    if [ $counter -eq 10 ]
	then
        IFS="|" read -a data_sources <<< "$line"
	fi
    
    if [ $counter -eq 11 ]
	then
        IFS="|" read -a associated_actors <<< "$line"
	fi

    data[$counter]=$line

    counter=$((counter+1))

done < "$1"

#generate json format for nicknames object - ################################
nicknames_string='['
count=0

for i in "${nicknames[@]}"
do

    nicknames_string="$nicknames_string \"$i\""
    new_count=$((count+1))
    
    #make sure a comma is not added after the last element
    if [ ${#nicknames_string[@]} -eq $new_count ] ; then
        nicknames_string="$nicknames_string"
    else
        nicknames_string="$nicknames_string, "
    fi
    count=$((count+1))
done

nicknames_string="$nicknames_string ]"

#generate json format for occupations object - ################################
occupations_string='['
count=0

for i in "${occupations[@]}"
do

    occupations_string="$occupations_string \"$i\""
    new_count=$((count+1))
    if [ ${#occupations[@]} -eq $new_count ] ; then
        occupations_string="$occupations_string"
    else
        occupations_string="$occupations_string, "
    fi
    count=$((count+1))
done

occupations_string="$occupations_string ]"

#generate json format for achievements object - ################################
achievements_string='['
count=0

for i in "${achievements[@]}"
do

    achievements_string="$achievements_string \"$i\""
    new_count=$((count+1))
    if [ ${#achievements[@]} -eq $new_count ] ; then
        achievements_string="$achievements_string"
    else
        achievements_string="$achievements_string, "
    fi
    count=$((count+1))
done

achievements_string="$achievements_string ]"
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
        data_sources_string="$data_sources_string, "
    fi
    count=$((count+1))
done

data_sources_string="$data_sources_string ]"

#generate json format for associated_actors object - ################################
associated_actors_string='['
count=0

for i in "${associated_actors[@]}"
do

    associated_actors_string="$associated_actors_string \"$i\""
    new_count=$((count+1))
    if [ ${#associated_actors[@]} -eq $new_count ] ; then
        associated_actors_string="$associated_actors_string"
    else
        associated_actors_string="$associated_actors_string, "
    fi
    count=$((count+1))
done

associated_actors_string="$associated_actors_string ]"

#generate json format for links object - ################################
links_string='{ mf_img_link : "'${data[8]}'", '
count=0

echo $links_string

for i in "${variable_links[@]}"
do

    IFS="#" read -a tuple <<< "$i"

    links_string="$links_string \"${tuple[0]}\" : \"${tuple[1]}\""
    new_count=$((count+1))
    if [ ${#variable_links[@]} -eq $new_count ] ; then
        links_string="$links_string"
    else
        links_string="$links_string, "
    fi
    count=$((count+1))
done

links_string="$links_string }"

echo $links_string

insert_cmd='db.actor_data_v0_2.insert( { 
"stage_name" : '\"${data[0]}\"', 
"birth_name" : '\"${data[1]}\"',
"nicknames" : '$nicknames_string',
"d_o_b" : '${data[3]}',
"occupations" : '$occupations_string',
"origin" : '\"${data[5]}\"',
"achievements" : '$achievements_string',
"bio" : '\"${data[7]}\"',
"data_sources" : '$data_sources_string',
"associated_actors" : '$associated_actors_string',
"links" : '$links_string'
} );'

echo $insert_cmd

mongo ds141937.mlab.com:41937/heroku_w63fjrg6 -u tom -p tom --eval "$insert_cmd"