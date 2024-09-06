clean:
	rm -rf node_modules

check-project-versions:
	npm search openchs-models
	npm search avni-health-modules

deps:
	yarn install

start:
	yarn start

start-dark:
	yarn start-dark

start-with-staging:
	cp env_templates/.env.staging.local.template .env.development.local
	yarn start-with-staging

start-with-prerelease:
	cp env_templates/.env.prerelease.local.template .env.development.local
	yarn start-with-prerelease

start-with-prod:
	cp env_templates/.env.prod.local.template .env.development.local
	yarn start-with-prod

start-with-rwb-prod:
	cp env_templates/.env.prod.local.template .env.development.local
	yarn start-with-rwb-prod

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
	make deploy_platform_translations poolId=$(OPENCHS_STAGING_USER_POOL_ID) clientId=$(OPENCHS_STAGING_APP_CLIENT_ID) server=https://staging.avniproject.org port=443 username=admin password=$(OPENCHS_STAGING_ADMIN_PASSWORD)

deploy_platform_translations_live:
	make deploy_platform_translations poolId=$(OPENCHS_PROD_USER_POOL_ID) clientId=$(OPENCHS_PROD_APP_CLIENT_ID) server=https://app.avniproject.org port=443 username=admin password=$(OPENCHS_PROD_ADMIN_PASSWORD)

deploy_platform_translations_production: deploy_platform_translations_live

deploy_platform_translations_prerelease:
	make deploy_platform_translations poolId=$(OPENCHS_PRERELEASE_USER_POOL_ID) clientId=$(OPENCHS_PRERELEASE_APP_CLIENT_ID) server=https://prerelease.avniproject.org port=443 username=admin password=$(OPENCHS_PRERELEASE_ADMIN_PASSWORD)
deploy_platform_translations_rwb_staging:
	make deploy_platform_translations poolId=$(RWB_STAGING_USER_POOL_ID) clientId=$(RWB_STAGING_APP_CLIENT_ID) server=https://staging.rwb.avniproject.org port=443 username=admin password=$(RWB_STAGING_ADMIN_PASSWORD)
deploy_platform_translations_rwb_prod:
	make deploy_platform_translations poolId=$(RWB_PROD_USER_POOL_ID) clientId=$(RWB_PROD_APP_CLIENT_ID) server=https://app.rwb.avniproject.org port=443 username=admin password=$(RWB_PROD_ADMIN_PASSWORD)

deploy_static_local:
	-rm -rf ../avni-server/static
	mkdir ../avni-server/static
	cp -r public/* ../avni-server/static

deploy_build_local: build-app
	-rm -rf ../avni-server/static
	mkdir ../avni-server/static
	cp -r build/* ../avni-server/static


zip-app:
	yarn install
	yarn run build
	tar -czvf avni-webapp.tgz  -C build .

zip-app-only:
	tar -czvf avni-webapp.tgz  -C build .
