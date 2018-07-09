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
	flyway -user=openchs -password=password -url=jdbc:postgresql://localhost:5432/$1 -schemas=public -locations=filesystem:../openchs-server/openchs-server-api/src/main/resources/db/migration/ -table=schema_version migrate
endef

su:=$(shell id -un)
DB=openchs

# <postgres>
clean_db_server:
	make _clean_db database=$(DB)
	make _clean_db database=openchs_test
	-psql -h localhost -U $(su) -d postgres -c 'drop role openchs';
	-psql -h localhost -U $(su) -d postgres -c 'drop role demo';

_clean_db:
	-psql -h localhost -U $(su) -d postgres -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '$(database)' AND pid <> pg_backend_pid()"
	-psql -h localhost -U $(su) -d postgres -c 'drop database $(database)';

_build_db:
	-psql -h localhost -U $(su) -d postgres -c "create user openchs with password 'password'";
	psql -h localhost -U $(su) -d postgres -c 'create database $(database) with owner openchs';
	-psql -h localhost -U $(su) -d $(database) -c 'create extension if not exists "uuid-ossp"';
	-psql -h localhost -U $(su) -d postgres  -c 'create role demo with NOINHERIT NOLOGIN';
	-psql -h localhost -U $(su) -d postgres  -c 'grant demo to openchs';
# </postgres>

# <db>
clean_db: ## Drops the database
	make _clean_db database=$(DB)

build_db: ## Creates new empty database
	make _build_db database=$(DB)

delete_org_meta_data:
	psql -h localhost -U $(su) $(DB) -f openchs-server-api/src/main/resources/database/deleteOrgMetadata.sql -v orgId=$(orgId)

rebuild_db: clean_db build_db ## clean + build db

rebuild_dev_db: rebuild_db deploy_schema

restore_db:
	psql -Uopenchs $(DB) -f $(sqlfile)

delete_tx_data:
	psql -Uopenchs $(DB) -f openchs-server-api/src/main/resources/database/deleteTxData.sql
# </db>

# <testdb>
clean_testdb: ## Drops the test database
	make _clean_db database=openchs_test

_create_demo_organisation:
	-psql -h localhost -U $(su) -d $(database) -f make-scripts/create_demo_organisation.sql

build_testdb: ## Creates new empty database of test database
	make _build_db database=openchs_test
	make _create_demo_organisation database=openchs_test

rebuild_testdb: clean_testdb build_testdb deploy_test_schema ## clean + build test db
# </testdb>


# <schema>
deploy_schema: ## Runs all migrations to create the schema with all the objects
	$(call _deploy_schema,$(DB))

deploy_test_schema: ## Runs all migrations to create the schema with all the objects
	$(call _deploy_schema,openchs_test)
# </schema>


# <server>
start_server: build_server
	OPENCHS_DATABASE=$(DB) java -jar openchs-server-api/build/libs/openchs-server-0.0.1-SNAPSHOT.jar

debug_server: build_server
	OPENCHS_DATABASE=$(DB) java -Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005 -jar openchs-server-api/build/libs/openchs-server-0.0.1-SNAPSHOT.jar

build_server: ## Builds the jar file
	./gradlew clean build -x test

test_server: rebuild_testdb ## Run tests
	GRADLE_OPTS="-Xmx256m" ./gradlew clean test

start_server_wo_gradle:
	java -jar openchs-server-api/target/openchs-server-api-0.1-SNAPSHOT.jar --cognito.clientid=$(client) --cognito.poolid=$(pool)
# <server>

ci-test:
	-psql -h localhost -Uopenchs openchs_test -c 'create extension if not exists "uuid-ossp"';
	./gradlew clean test

open_test_results:
	open openchs-server-api/build/reports/tests/test/index.html

build-rpm:
	./gradlew clean openchs-server-api:buildRpm -x test --info --stacktrace

upload-rpm:
	@openssl aes-256-cbc -a -md md5 -in infra/rpm/keys/openchs.asc.enc -d -out infra/rpm/keys/openchs.asc -k ${ENCRYPTION_KEY}
	-rm -rf openchs-server-api/build
	./gradlew clean openchs-server-api:uploadRpm -x test --info --stacktrace --rerun-tasks

# <exec-sql>
exec-sql: ## Usage: make exec-sql sqlfile=</path/to/sql>
	psql -Uopenchs -f $(sqlfile)
# </exec-sql>