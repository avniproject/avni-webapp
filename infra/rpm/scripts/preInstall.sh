#!/bin/sh

remove_all_existing_files(){
    FILES=(/opt/openchs, /etc/openchs, /etc/init.d/openchs, /var/run/openchs, /var/log/openchs)
    for f in ${FILES}:
    do
        rm -rf f
    done
}

remove_all_existing_files