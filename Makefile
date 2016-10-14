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
