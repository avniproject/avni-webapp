install:
	docker pull openchs/httpd:2.2

stop:
	@echo "Stopping httpd"
	-docker kill httpd
	-docker rm httpd

run:
	@echo "Starting HTTPD"
	-docker kill httpd
	-docker rm httpd
	docker run -d -v $(shell pwd)/config:/usr/local/apache2/htdocs/config -p 0.0.0.0:3000:80 --name httpd openchs/httpd:2.2

restart: stop run