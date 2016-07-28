build:
	@echo "Building HTTPD container"
	-docker-compose build
	-docker-compose push httpd

stop:
	@echo "Stopping httpd"
	-docker-compose stop
	-docker-compose kill
	-docker-compose rm

run:
	@echo "Starting HTTPD"
	docker-compose up

restart: stop run