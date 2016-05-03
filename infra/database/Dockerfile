FROM postgres:9.5.2

RUN apt-get update
RUN apt-get install vim
ADD postgres-migrations /tmp/postgres-migrations
ADD dogfish /tmp/dogfish
ADD migrate.sh /docker-entrypoint-initdb.d/migrate.sh
