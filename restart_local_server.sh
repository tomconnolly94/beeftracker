#!/bin/bash
cd gulp
gulp build
cd -

#proc_id="$(fuser 5000/tcp)"
#kill -9 "${proc_id}"
heroku local
