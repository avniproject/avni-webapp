clean:
	rm -rf node_modules

check-project-versions:
	npm search openchs-models
	npm search avni-health-modules

deps:
	yarn install

start:
	yarn start

start-with-staging:
	cp env_templates/.env.staging.local.template .env.development.local
	yarn start-with-staging

start-with-prod:
	cp env_templates/.env.prod.local.template .env.development.local
	yarn start-with-prod

storybook:
	yarn storybook

test-only:
	yarn test --watchAll

test: build-app test-only

build-app:
	yarn run build

prettier-all:
	yarn prettier-all

cy-run:
	yarn cy:run

cy-open:
	yarn cy:open

port:= $(if $(port),$(port),8021)
server:= $(if $(server),$(server),http://localhost)

auth:
ifndef password
	@echo "Please provide password for the admin user"
	exit 1
endif
	$(if $(password),$(eval token:=$(shell node scripts/token.js '$(server):$(port)' $(username) $(password))))

upload = \
	curl -X POST $(server):$(port)/$(1) -d $(2)  \
		-H "Content-Type: application/json"  \
		-H "USER-NAME: admin"  \
		-H "AUTH-TOKEN: $(token)"

deploy_platform_translations: auth
	$(call upload,platformTranslation,@translations/en.json)
	@echo
	$(call upload,platformTranslation,@translations/gu_IN.json)
	@echo
	$(call upload,platformTranslation,@translations/hi_IN.json)
	@echo
	$(call upload,platformTranslation,@translations/mr_IN.json)
	@echo
	$(call upload,platformTranslation,@translations/ta_IN.json)
	@echo
	$(call upload,platformTranslation,@translations/ka_IN.json)

deploy_platform_translations_staging:
	make deploy_platform_translations poolId=$(OPENCHS_STAGING_USER_POOL_ID) clientId=$(OPENCHS_STAGING_APP_CLIENT_ID) server=https://staging.openchs.org port=443 username=admin password=$(password)

deploy_platform_translations_live:
	make deploy_platform_translations poolId=$(OPENCHS_PROD_USER_POOL_ID) clientId=$(OPENCHS_PROD_APP_CLIENT_ID) server=https://server.openchs.org port=443 username=admin password=$(password)


deploy_platform_translations_prerelease:
	make deploy_platform_translations poolId=$(OPENCHS_PRERELEASE_USER_POOL_ID) clientId=$(OPENCHS_PRERELEASE_APP_CLIENT_ID) server=https://prerelease.openchs.org port=443 username=admin password=$(password)
