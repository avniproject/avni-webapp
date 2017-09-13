#!/bin/sh

USERID=openchs
GROUPID=openchs
id -g ${GROUPID}
if [ $? -eq 1 ]; then
    groupadd openchs
fi

id ${USERID}
if [ $? -eq 1 ]; then
    useradd -g openchs openchs
fi

ln -s /opt/openchs/config /etc/openchs
ln -s /opt/openchs/scripts/openchs /etc/init.d/openchs
ln -s /opt/openchs/run /var/run/openchs
ln -s /opt/openchs/log /var/log/openchs
chmod a+x /opt/openchs/scripts/openchs
chkconfig openchs on

chown -R openchs:openchs /opt/openchs
chown -R openchs:openchs /var/log/openchs
chown -R openchs:openchs /var/run/openchs
chown -R openchs:openchs /etc/init.d/openchs
chown -R openchs:openchs /etc/openchs

