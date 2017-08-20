su:=$(shell id -un)

build: stop
	@echo "Building all containers"
	docker-compose rm -f
	@echo "Building all containers"
	docker-compose build

release:
	@echo "Building all containers"
	docker-compose push httpd

stop:
	@echo "Stopping all services"
	docker-compose stop
	docker-compose kill

start:
	@echo "Starting all services"
	docker-compose up

restart: stop start

start-app:
	@echo "Starting the application"
	mvn clean install -DskipTests
	java -jar openchs-server-api/target/openchs-server-api-0.1-SNAPSHOT.jar

download-app:
	wget https://drive.google.com/open?id=0B8GldZt10g1IMVNsMk9Oc21URTA -O openchs-server-0.1-SNAPSHOT.jar

init-db:
	-psql -h localhost -U $(su) postgres -c "create user openchs with password 'password'";
	-psql -h localhost -U $(su) postgres -c 'create database openchs with owner openchs';
	-psql -h localhost openchs -c 'create extension if not exists "uuid-ossp"';

reset-db:
	-psql -h localhost -U $(su) postgres -c 'drop database openchs';
	-psql -h localhost -U $(su) postgres -c 'create database openchs with owner openchs';
	flyway -user=openchs -password=password -url=jdbc:postgresql://localhost:5432/openchs -schemas=public clean
	flyway -user=openchs -password=password -url=jdbc:postgresql://localhost:5432/openchs -schemas=public -locations=filesystem:./src/main/resources/db/migration/ migrate

binary:
	mvn clean install -DskipTests

app-server-start: binary
	cd openchs-server-api && mvn sprint-boot:run
