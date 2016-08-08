build: stop
	-docker-compose rm -f
	@echo "Building HTTPD container"
	-docker-compose build

release:
	-docker-compose push httpd

stop:
	@echo "Stopping httpd"
	-docker-compose stop
	-docker-compose kill

start:
	@echo "Starting HTTPD"
	docker-compose up

restart: stop start
