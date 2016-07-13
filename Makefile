install:
	docker build -t openchs-httpd .

stop:
	@echo "Stopping httpd"

run:
	@echo "Starting HTTPD"
	docker run -d -v $(shell pwd)/config:/usr/local/apache2/htdocs/config -p 127.0.0.1:3000:80 --name httpd openchs-httpd
