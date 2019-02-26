#!/bin/bash

#require file structure
#beeftracker
#|-- beeftracker_integration_testing
#|-- bf-dev
#|   |-- test



usage() { echo "Usage: $0 [-d debug mode is active]" 1>&2; exit 1; }
DEBUG_MODE=false
LOG=/dev/null
TMP_LOG_FILE=../check_deploy_node_server_log.log
PERSIST_LOGS=false



while getopts "dp" o; do
    case "${o}" in
        d)
            echo "DEBUG_MODE active"
            DEBUG_MODE=true
            LOG=$TMP_LOG_FILE
            ;;
        p)
            echo "Persistent logs active"
            PERSIST_LOGS=true
            ;;
        *)
            usage
            ;;
    esac
done



unsuccessful_exit(){
    echo "Unsuccessful deploy."
    echo "Exit code: $1"
    exit $1
}



#move up before starting tests
cd ../



echo ""
#build server files
cd bf-dev
echo "Building server files..."
gulp build > $LOG 2>&1 || unsuccessful_exit 2
if [ $? -eq 0 ] ; then
    echo "Build successful."
else
    echo "Build failed. Please check the $0 log"
    unsuccessful_exit 3
fi
cd - > /dev/null 2>&1



echo ""
#run unit tests
cd bf-dev/test
echo "Running Unit Tests..."
./run_tests.sh > $LOG 2>&1 || unsuccessful_exit 4
if [ $? -eq 0 ] ; then
    echo "Unit tests successful."
else
    echo "Unit tests failed. Please check the $0 log"
    unsuccessful_exit 5
fi
cd - > /dev/null 2>&1



echo ""
#run server
if $DEBUG_MODE ; then
    touch $TMP_LOG_FILE
fi
cd bf-dev
echo "Running Node server..."
node index.js > $LOG 2>&1 &
echo $!
server_pid=$(echo $! | tr ":" "\n")
jobsvar=$(jobs)
if [ -n "$jobsvar" ]; then
    echo "Node server running."
    echo "Node server PID: $server_pid"
else
    echo "Server run was unsuccessful. Please check the $0 log"
    unsuccessful_exit 6
fi
cd - > /dev/null 2>&1



echo ""
#run integration tests
cd beeftracker_integration_testing
echo "Running Integration Tests..."
./run_tests.sh > $LOG 2>&1 || unsuccessful_exit 7
echo "integration test result $?"
if [ $? -eq 0 ] ; then
    echo "Integration tests successful."
else
    echo "Integration tests failed. Please check the $0 log"
    unsuccessful_exit 8
fi
cd - > /dev/null 2>&1



echo ""
#kill server
echo "Killing server..."
kill -9 $server_pid
echo "Server Killed."



#delete tmp server log file
if ! $PERSIST_LOGS ; then
    rm $TMP_LOG_FILE
fi


echo "Successful deploy."
exit 0