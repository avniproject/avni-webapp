#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE USER openchs WITH PASSWORD 'password';
    CREATE DATABASE openchs;
    GRANT ALL PRIVILEGES ON DATABASE openchs TO openchs;

    CREATE USER openchs_test WITH PASSWORD 'password';
    CREATE DATABASE openchs_test;
    GRANT ALL PRIVILEGES ON DATABASE openchs_test TO openchs_test;
EOSQL