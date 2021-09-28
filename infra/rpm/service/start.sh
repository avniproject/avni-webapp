#!/bin/bash
nohup java $OPENCHS_SERVER_OPTS -jar /opt/openchs/bin/avni-server.jar >> /var/log/openchs/openchs.log 2>&1 &
echo $! > /var/run/openchs/openchs.pid
