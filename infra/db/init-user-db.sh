#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE USER erp_owner WITH PASSWORD 'erp_owner';
    CREATE DATABASE egov;
    GRANT ALL PRIVILEGES ON DATABASE egov TO erp_owner;
EOSQL