# https://hub.docker.com/_/postgres/
docker run --name openchs-database -e POSTGRES_PASSWORD=password POSTGRES_DB=openchs -d postgres