FROM postgres:9.5.2

ADD postgres-migrations /tmp
ADD dogfish /tmp
ADD create-database.sh /docker-entrypoint-initdb.d/
# ADD migrate.sh /docker-entrypoint-initdb.d/