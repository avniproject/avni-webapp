# <makefile>
# Objects: db, schema, server, package, env (code environment)
# Actions: clean, build, deploy, test
help:
	@IFS=$$'\n' ; \
	help_lines=(`fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//'`); \
	for help_line in $${help_lines[@]}; do \
	    IFS=$$'#' ; \
	    help_split=($$help_line) ; \
	    help_command=`echo $${help_split[0]} | sed -e 's/^ *//' -e 's/ *$$//'` ; \
	    help_info=`echo $${help_split[2]} | sed -e 's/^ *//' -e 's/ *$$//'` ; \
	    printf "%-30s %s\n" $$help_command $$help_info ; \
	done
# </makefile>


define _deploy_schema
	flyway -user=openchs -password=password -url=jdbc:postgresql://localhost:5432/$1 -schemas=public -locations=filesystem:./avni-server-api/src/main/resources/db/migration/ -table=schema_version migrate
endef

su:=$(shell id -un)
DB=openchs
dbServer=localhost
dbPort=5432

# <postgres>
clean_db_server: _clean_db_server _clean_test_server _drop_roles

_clean_db_server:
	make _clean_db database=$(DB)

_clean_test_server:
	make _clean_db database=openchs_test

_drop_roles:
	-psql -h $(dbServer) -p $(dbPort) -U $(su) -d postgres -c 'drop role openchs';
	-psql -h $(dbServer) -p $(dbPort) -U $(su) -d postgres -c 'drop role demo';
	-psql -h $(dbServer) -p $(dbPort) -U $(su) -d postgres -c 'drop role openchs_impl';
	-psql -h $(dbServer) -p $(dbPort) -U $(su) -d postgres -c 'drop role organisation_user';

_clean_db:
	-psql -h $(dbServer) -p $(dbPort) -U $(su) -d postgres -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '$(database)' AND pid <> pg_backend_pid()"
	-psql -h $(dbServer) -p $(dbPort) -U $(su) -d postgres -c 'drop database $(database)';

_build_db:
	-psql -h $(dbServer) -p $(dbPort) -U $(su) -d postgres -c "create user openchs with password 'password' createrole";
	-psql -h $(dbServer) -p $(dbPort) -U $(su) -d postgres -c 'create database $(database) with owner openchs';
	-psql -h $(dbServer) -p $(dbPort) -U $(su) -d $(database) -c 'create extension if not exists "uuid-ossp"';
	-psql -h $(dbServer) -p $(dbPort) -U $(su) -d $(database) -c 'create extension if not exists "ltree"';
	-psql -h $(dbServer) -p $(dbPort) -U $(su) -d $(database) -c 'create extension if not exists "hstore"';
	-psql -h $(dbServer) -p $(dbPort) -U $(su) -d postgres  -c 'create role demo with NOINHERIT NOLOGIN';
	-psql -h $(dbServer) -p $(dbPort) -U $(su) -d postgres  -c 'grant demo to openchs';
	-psql -h $(dbServer) -p $(dbPort) -U $(su) -d postgres  -c 'create role openchs_impl';
	-psql -h $(dbServer) -p $(dbPort) -U $(su) -d postgres  -c 'grant openchs_impl to openchs';
	-psql -h $(dbServer) -p $(dbPort) -U $(su) -d postgres  -c 'create role organisation_user createrole admin openchs_impl';
# </postgres>

# <db>
## Drops the database
clean_db: _clean_db_server

build_db: ## Creates new empty database
	make _build_db database=$(DB)

orgId:= $(if $(orgId),$(orgId),0)

delete_org_meta_data:
	psql -h $(dbServer) -p $(dbPort) -U $(su) $(DB) -f avni-server-api/src/main/resources/database/deleteOrgMetadata.sql -v orgId=$(orgId)

delete_org_data:
	@echo 'Delete for Organisation ID = $(orgId)'
	psql -h $(dbServer) -p $(dbPort) -U $(su) $(DB) -f avni-server-api/src/main/resources/database/deleteOrgData.sql -v orgId=$(orgId)

create_base_local_test_data:
	@echo 'Creating base data'
	psql -h $(dbServer) -p $(dbPort) -U $(su) $(DB) -f avni-server-api/src/main/resources/database/createBaseLocalTestData.sql

create_local_test_data:
	newman run postman/local_test_data_setup.json -e postman/localhost.postman_environment.json

recreate_local_test_data: rebuild_db deploy_schema create_base_local_test_data create_local_test_data

rebuild_db: clean_db build_db ## clean + build db

rebuild_dev_db: rebuild_db deploy_schema

restore_db:
	psql -U openchs $(DB) -f $(sqlfile)

# </db>

# <testdb>
backup_db:
	sudo -u $(su) pg_dump openchs > avni-server-api/target/backup.sql

clean_testdb: ## Drops the test database
	make _clean_db database=openchs_test

_create_demo_organisation:
	-psql -h $(dbServer) -p $(dbPort) -U $(su) -d $(database) -f make-scripts/create_demo_organisation.sql

build_testdb: ## Creates new empty database of test database
	make _build_db database=openchs_test
#	make _create_demo_organisation database=openchs_test

rebuild_testdb: clean_testdb build_testdb ## clean + build test db
# </testdb>


# <schema>
deploy_schema: ## Runs all migrations to create the schema with all the objects
	$(call _deploy_schema,$(DB))

deploy_test_schema: ## Runs all migrations to create the schema with all the objects
	$(call _deploy_schema,openchs_test)
# </schema>


# <server>
start_server: build_server
	OPENCHS_DATABASE=$(DB) java -jar avni-server-api/build/libs/avni-server-0.0.1-SNAPSHOT.jar

start_server_keycloak: build_server
	OPENCHS_MODE=on-premise OPENCHS_DATABASE=$(DB) java -jar avni-server-api/build/libs/avni-server-0.0.1-SNAPSHOT.jar

start_server_remote_db: build_server
	OPENCHS_DATABASE_URL=jdbc:postgresql://192.168.33.11:5432/openchs java -jar avni-server-api/build/libs/avni-server-0.0.1-SNAPSHOT.jar

debug_server: build_server
	OPENCHS_DATABASE=$(DB) java -Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005 -jar avni-server-api/build/libs/avni-server-0.0.1-SNAPSHOT.jar

debug_server_remote_db: build_server
	OPENCHS_DATABASE_URL=jdbc:postgresql://192.168.33.11:5432/openchs java -Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005 -jar avni-server-api/build/libs/avni-server-0.0.1-SNAPSHOT.jar

build_server: ## Builds the jar file
	./gradlew clean build -x test

boot_run:
	OPENCHS_DATABASE=$(DB) ./gradlew bootRun

test_server: rebuild_testdb ## Run tests
	GRADLE_OPTS="-Xmx256m" ./gradlew clean test

test_server_with_remote_db:
	make rebuild_testdb su=$(DBUSER) dbServer=$(DBSERVER)
	OPENCHS_DATABASE_URL=jdbc:postgresql://$(DBSERVER):5432/openchs_test GRADLE_OPTS="-Xmx256m" ./gradlew clean test

start_server_wo_gradle:
	java -jar avni-server-api/build/libs/avni-server-0.0.1-SNAPSHOT.jar

# LIVE
log_live:
	tail -f /var/log/openchs/openchs.log
# /LIVE

# STAGING
# I have setup the environment variables in my bash_profile so that I can just run it whenever I want in live mode. You could do that too (Vivek).
tunnel_staging_db:
	ssh avni-server-staging -L 6015:stagingdb.openchs.org:5432


tunnel_staging_server_for_debug:
	ssh avni-server-staging -L 5005:127.0.0.1:5005

start_server_staging: build_server
	-mkdir -p /tmp/openchs && sudo ln -s /tmp/openchs /var/log/openchs

	OPENCHS_MODE=staging \
	OPENCHS_COGNITO_IN_DEV=false \
	OPENCHS_CLIENT_ID=$(OPENCHS_STAGING_APP_CLIENT_ID) \
	OPENCHS_USER_POOL=$(OPENCHS_STAGING_USER_POOL_ID) \
	OPENCHS_IAM_USER=$(OPENCHS_STAGING_IAM_USER) \
	OPENCHS_IAM_USER_ACCESS_KEY=$(OPENCHS_STAGING_IAM_USER_ACCESS_KEY) \
	OPENCHS_IAM_USER_SECRET_ACCESS_KEY=$(OPENCHS_STAGING_IAM_USER_SECRET_ACCESS_KEY) \
	OPENCHS_BUCKET_NAME=staging-user-media \
  OPENCHS_DATABASE_URL=jdbc:postgresql://localhost:6015/openchs \
    java -jar avni-server-api/build/libs/avni-server-0.0.1-SNAPSHOT.jar

debug_server_staging: build_server
	-mkdir -p /tmp/openchs && sudo ln -s /tmp/openchs /var/log/openchs
	OPENCHS_DATABASE_URL=jdbc:postgresql://localhost:6015/openchs \
	OPENCHS_MODE=staging \
	OPENCHS_COGNITO_IN_DEV=false \
	OPENCHS_CLIENT_ID=$(OPENCHS_STAGING_APP_CLIENT_ID) \
	OPENCHS_USER_POOL=$(OPENCHS_STAGING_USER_POOL_ID) \
	OPENCHS_IAM_USER=$(OPENCHS_STAGING_IAM_USER) \
	OPENCHS_IAM_USER_ACCESS_KEY=$(OPENCHS_STAGING_IAM_USER_ACCESS_KEY) \
	OPENCHS_IAM_USER_SECRET_ACCESS_KEY=$(OPENCHS_STAGING_IAM_USER_SECRET_ACCESS_KEY) \
	OPENCHS_BUCKET_NAME=staging-user-media \
		java -Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005 -jar avni-server-api/build/libs/avni-server-0.0.1-SNAPSHOT.jar

tail-staging-log:
	ssh avni-server-staging "tail -f -n1000 /var/log/openchs/openchs.log"

tail-local-log:
	tail -f -n1000 /var/log/openchs/openchs.log
# /STAGING

debug_server_live: build_server
	OPENCHS_MODE=live OPENCHS_CLIENT_ID=$(STAGING_APP_CLIENT_ID) OPENCHS_USER_POOL=$(STAGING_USER_POOL_ID) java -Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005 -jar avni-server-api/build/libs/avni-server-0.0.1-SNAPSHOT.jar
# <server>

ci-test:
	-psql -h $(dbServer) -p $(dbPort) -Uopenchs openchs_test -c 'create extension if not exists "uuid-ossp"';
	-psql -h $(dbServer) -p $(dbPort) -Uopenchs openchs_test -c 'create extension if not exists "ltree"';
	-psql -h $(dbServer) -p $(dbPort) -Uopenchs openchs_test -c 'create extension if not exists "hstore"';

	make test_server

open_test_results:
	open avni-server-api/build/reports/tests/test/index.html

build-rpm:
	./gradlew clean avni-server-api:buildRpm -x test --info --stacktrace

upload-rpm:
	@openssl aes-256-cbc -a -md md5 -in infra/rpm/keys/openchs.asc.enc -d -out infra/rpm/keys/openchs.asc -k ${ENCRYPTION_KEY}
	-rm -rf avni-server-api/build
	./gradlew clean avni-server-api:uploadRpm -x test --info --stacktrace --rerun-tasks

# <exec-sql>
exec-sql: ## Usage: make exec-sql sqlfile=</path/to/sql>
	psql -Uopenchs -f $(sqlfile)
# </exec-sql>

# remote
tail-prod:
	ssh avni-server-prod "tail -f /var/log/openchs/openchs.log"
