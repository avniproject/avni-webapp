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
	java -jar target/openchs-server-0.1-SNAPSHOT.jar

download-app:
	wget https://drive.google.com/open?id=0B8GldZt10g1IMVNsMk9Oc21URTA -O openchs-server-0.1-SNAPSHOT.jar

push-binary-to-demo:
	scp target/openchs-server-0.1-SNAPSHOT.jar root@139.59.8.249:/root/openchs-server/target/openchs-server-0.1-SNAPSHOT.jar