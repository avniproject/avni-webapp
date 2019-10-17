#!/bin/sh

for i in $(seq 1 8)
do
    sleep 5
    output=$(curl $1/ping 2>/dev/null)
    if [ "$output" = "pong" ]
    then
        break
    fi
done
if [ "$output" = "pong" ]
then
    echo "$1 ready"
    exit 0
fi
exit 1
