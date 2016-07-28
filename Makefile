build:
	@echo "Building HTTPD container"
	-docker build -t openchs/httpd:2.2 .
	-docker push openchs/httpd:2.2

stop:
	@echo "Stopping httpd"
	-docker-compose stop
	-docker-compose kill
	-docker-compose rm

run:
	@echo "Starting HTTPD"
	docker-compose up

restart: stop run