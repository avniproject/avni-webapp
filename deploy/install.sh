#!/bin/bash
sudo service openchs stop 2>&1 >/dev/null
sleep 5

sudo yum clean all 2>&1 >/dev/null
sudo rm -rf /var/cache/yum 2>&1 >/dev/null
sudo yum -y updateinfo 2>&1 >/dev/null
sudo yum -y remove avni-server openchs-server java-1.7.0-openjdk 2>&1 >/dev/null
sudo yum -y install /tmp/avni-server.rpm 2>&1 >/dev/null
sudo service openchs start 2>&1 >/dev/null

sleep 20
