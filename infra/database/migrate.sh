#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE openchs;
    GRANT ALL PRIVILEGES ON DATABASE openchs TO "$POSTGRES_USER";
EOSQL

cd /tmp
chmod -R 777 /tmp
runuser -l postgres -c './dogfish migrate openchs'