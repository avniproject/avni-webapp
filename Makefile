
check-node-v:
ifneq ($(shell node -v),$(shell cat .nvmrc))
	@echo -e '\nPlease run `nvm use` in your terminal to change node version\n'
	@exit 1
endif
	@node -v

clean:
	rm -rf node_modules

deps: check-node-v
	yarn install

start: check-node-v
	yarn start

start-with-staging-user-pool: check-node-v
	REACT_APP_COGNITO_IN_DEV=true \
	REACT_APP_COGNITO_USER_POOL_ID=$(OPENCHS_STAGING_USER_POOL_ID) \
	REACT_APP_COGNITO_APP_CLIENT_ID=$(OPENCHS_STAGING_APP_CLIENT_ID) \
	yarn start
