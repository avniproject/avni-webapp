#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE openchs;
    GRANT ALL PRIVILEGES ON DATABASE openchs TO "$POSTGRES_USER";
EOSQL