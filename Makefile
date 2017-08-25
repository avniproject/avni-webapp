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


su:=$(shell id -un)


## <db>
clean_db: ## Drops the database
	-psql -h localhost -U $(su) postgres -c 'drop database openchs';

build_db: ## Creates new empty database
	-psql -h localhost -U $(su) postgres -c 'create database openchs with owner openchs';
	-psql -h localhost -U $(su) postgres -c "create user openchs with password 'password'";
	-psql -h localhost -U $(su) postgres -c 'create database openchs with owner openchs';
	-psql -h localhost openchs -c 'create extension if not exists "uuid-ossp"';

rebuild_db: clean_db build_db ## clean + build db
## <db>


## <schema>
clean_schema: ## drops the schema
	flyway -user=openchs -password=password -url=jdbc:postgresql://localhost:5432/openchs -schemas=openchs clean

deploy_schema: ## Runs all migrations to create the schema with all the objects
	flyway -user=openchs -password=password -url=jdbc:postgresql://localhost:5432/openchs -schemas=openchs -locations=filesystem:../openchs-server/openchs-server-api/src/main/resources/db/migration/ migrate

redeploy_schema: clean_schema deploy_schema ## clean and deploy schema
## </schema>


## <server>
start_server: build_server ## Builds and starts the server
	mvn spring-boot:run
#	java -jar openchs-server-api/target/openchs-server-api-0.1-SNAPSHOT.jar

build_server: ## Builds the jar file
	mvn clean compile
	mvn install -DskipTests

test_server: ## Run tests
	mvn clean install
## <server>


#build: stop
#	@echo "Building all containers"
#	docker-compose rm -f
#	@echo "Building all containers"
#	docker-compose build
#release:
#	@echo "Building all containers"
#	docker-compose push httpd
#stop:
#	@echo "Stopping all services"
#	docker-compose stop
#	docker-compose kill
#start:
#	@echo "Starting all services"
#	docker-compose up
#restart: stop start