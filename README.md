# openchs-server

## Install docker
Ensure docker client is on the path

## Checkout the code for openchs-server if you haven't already

## Get the server infrastructure components running
Build docker images `make build`

Run the server infastructure component `make start`

Have a look at the makefile to know what other commands are there

## Start OpenCHS Server
OpenCHS Server is based on Maven and Spring Boot

`mvn clean install`

`mvn spring-boot:run`

## You may need the following as well
Download and install a Postgres client so that you cannot to the server
For connecting to Postgres you can use the - `psql -h 0.0.0.0 -U openchs`

### Build Status
[![CircleCI](https://circleci.com/gh/OpenCHS/openchs-server.svg?style=svg)](https://circleci.com/gh/OpenCHS/openchs-server)
