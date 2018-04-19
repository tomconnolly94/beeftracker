#!/bin/bash

gulp build

#proc_id="$(fuser 5000/tcp)"
#kill -9 "${proc_id}"
heroku local
