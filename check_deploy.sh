#!/bin/bash



### REQUIRED FILE STRUCTURE ###

#beeftracker
#|-- beeftracker_integration_testing
#|-- bf-dev
#|   |-- test



### USAGE ###

usage() {
    echo "Usage: "
    echo "      $0 [options]"
    echo ""
    echo "      -d: [DEBUG_MODE] Activate debug mode, $0 will print all test output to the console." 1>&2
    echo ""
    exit 1; 
}
DEBUG_MODE=false

### INTERPRET CMD LINE FLAGS ###

while getopts "dp" o; do
    case "${o}" in
        d)
            echo "DEBUG_MODE active"
            DEBUG_MODE=true
            ;;
        *)
            usage
            ;;
    esac
done



### Functions ###

unsuccessful_exit(){
    echo "!!! Unsuccessful deploy. !!!"
    echo "Exit code: $1"
    exit $1
}

process_output(){
	if $DEBUG_MODE ; then
		echo $1 > /dev/null
	else
		echo $1
	fi
}

kill_server(){
    echo ""
    echo "Killing server..."
    kill -9 $server_pid
    echo "Server Killed."
}



#move to beeftracker dir before starting tests
cd ../


### BUILD SERVER FILES ###

echo ""
cd bf-dev/gulp
echo "Building server files..."

exit_code=2
if $DEBUG_MODE ; then
    gulp build --production || unsuccessful_exit $exit_code
else
    gulp build --production > /dev/null 2>&1 || unsuccessful_exit $exit_code
fi

echo "Build successful."
cd - > /dev/null 2>&1



### UNIT TESTS ###

echo ""
cd bf-dev/test
echo "Running Unit Tests..."
exit_code=4
if $DEBUG_MODE ; then
    ./run_tests.sh || unsuccessful_exit $exit_code
else
    ./run_tests.sh > /dev/null || unsuccessful_exit $exit_code
fi

echo "Unit tests successful."
cd - > /dev/null 2>&1



### RUN NODE SERVER ###

echo ""
cd bf-dev
echo "Running Node server..."
exit_code=5
node index.js "load_envs_manually" > /dev/null &
sleep 3
server_pid=$(echo $! | tr ":" "\n")
jobsvar=$(jobs)
if [ -n "$jobsvar" ]; then
    echo "Node server running. PID: $server_pid"
    
else
    echo "Server start was unsuccessful."
    unsuccessful_exit $exit_code
fi

cd - > /dev/null



### INTEGRATION TESTS ###

echo ""
cd beeftracker_integration_testing
echo "Running Integration Tests..."
exit_code=6
if $DEBUG_MODE ; then
    ./run_tests.sh
else
    ./run_tests.sh > /dev/null 2>&1
fi

if [ $? -ne 0 ] ; then
    kill_server
    echo "Integration tests were unsuccessful."
    unsuccessful_exit $exit_code
fi

echo "Integration tests successful."
cd - > /dev/null 2>&1


### KILL SERVER ###

kill_server



echo ""
echo "Successful deploy."
exit 0