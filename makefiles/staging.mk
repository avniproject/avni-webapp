# I have setup the environment variables in my bash_profile so that I can just run it whenever I want in live mode. You could do that too (Vivek).
tunnel_staging_db:
	ssh avni-server-staging -L 6015:stagingdb.openchs.org:5432

tunnel_staging_server_for_debug:
	ssh avni-server-staging -L 5005:127.0.0.1:5005

start_server_staging: build_server
	-mkdir -p /tmp/openchs && sudo ln -s /tmp/openchs /var/log/openchs

	OPENCHS_MODE=staging \
	OPENCHS_COGNITO_IN_DEV=false \
	OPENCHS_CLIENT_ID=$(OPENCHS_STAGING_APP_CLIENT_ID) \
	OPENCHS_USER_POOL=$(OPENCHS_STAGING_USER_POOL_ID) \
	OPENCHS_IAM_USER=$(OPENCHS_STAGING_IAM_USER) \
	OPENCHS_IAM_USER_ACCESS_KEY=$(OPENCHS_STAGING_IAM_USER_ACCESS_KEY) \
	OPENCHS_IAM_USER_SECRET_ACCESS_KEY=$(OPENCHS_STAGING_IAM_USER_SECRET_ACCESS_KEY) \
	OPENCHS_BUCKET_NAME=staging-user-media \
  	OPENCHS_DATABASE_URL=jdbc:postgresql://localhost:6015/openchs \
    	java -jar avni-server-api/build/libs/avni-server-0.0.1-SNAPSHOT.jar

debug_server_staging: build_server
	-mkdir -p /tmp/openchs && sudo ln -s /tmp/openchs /var/log/openchs
	OPENCHS_DATABASE_URL=jdbc:postgresql://localhost:6015/openchs \
	OPENCHS_MODE=staging \
	OPENCHS_COGNITO_IN_DEV=false \
	OPENCHS_CLIENT_ID=$(OPENCHS_STAGING_APP_CLIENT_ID) \
	OPENCHS_USER_POOL=$(OPENCHS_STAGING_USER_POOL_ID) \
	OPENCHS_IAM_USER=$(OPENCHS_STAGING_IAM_USER) \
	OPENCHS_IAM_USER_ACCESS_KEY=$(OPENCHS_STAGING_IAM_USER_ACCESS_KEY) \
	OPENCHS_IAM_USER_SECRET_ACCESS_KEY=$(OPENCHS_STAGING_IAM_USER_SECRET_ACCESS_KEY) \
	OPENCHS_BUCKET_NAME=staging-user-media \
		java -Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005 -jar avni-server-api/build/libs/avni-server-0.0.1-SNAPSHOT.jar

tail-staging-log:
	ssh avni-server-staging "tail -f -n1000 /var/log/openchs/openchs.log"
