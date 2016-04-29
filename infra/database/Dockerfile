FROM postgres:9.5.2

ADD postgres-migrations /tmp/postgres-migrations
ADD dogfish /tmp/dogfish
ADD create-database.sh /docker-entrypoint-initdb.d/create-database.sh
# ADD migrate.sh /docker-entrypoint-initdb.d/
