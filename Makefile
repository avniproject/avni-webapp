check-node-v:
ifneq ($(shell node -v),$(shell cat .nvmrc))
	@echo -e '\nPlease run `nvm use` in your terminal to change node version\n'
	@exit 1
endif
	@node -v

clean:
	rm -rf node_modules

deps:
	yarn install

start:
	yarn start

storybook: check-node-v
	yarn storybook

test:
	yarn test --watchAll

build:
	yarn run build

prettier-all: check-node-v
	yarn prettier-all

cy-run: check-node-v
	yarn cy:run

cy-open: check-node-v
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
