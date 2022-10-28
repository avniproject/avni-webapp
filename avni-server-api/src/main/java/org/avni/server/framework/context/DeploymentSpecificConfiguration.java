package org.avni.server.framework.context;

import org.avni.server.application.OrganisationConfigSettingKey;
import org.avni.server.config.AvniKeycloakConfig;
import org.avni.server.config.CognitoConfig;
import org.avni.server.dao.UserRepository;
import org.avni.server.domain.JsonObject;
import org.avni.server.domain.Organisation;
import org.avni.server.domain.OrganisationConfig;
import org.avni.server.domain.User;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.service.*;
import org.avni.server.web.AuthDetailsController;
import org.keycloak.OAuth2Constants;
import org.keycloak.representations.adapters.config.AdapterConfig;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.*;

@Configuration
public class DeploymentSpecificConfiguration {

    public static final String SCOPE = "openid";
    @Qualifier("AWSS3Service")
    @Autowired(required = false)
    private AWSS3Service awss3Service;

    @Qualifier("AWSMinioService")
    @Autowired(required = false)
    private AWSMinioService awsMinioService;

    @Qualifier("CognitoIdpService")
    @Autowired(required = false)
    private CognitoIdpService cognitoIdpService;

    @Qualifier("KeycloakIdpService")
    @Autowired(required = false)
    private KeycloakIdpService keycloakIdpService;

    private final UserRepository userRepository;
    private final SpringProfiles springProfiles;
    private final AvniKeycloakConfig avniKeycloakConfig;
    private final CognitoConfig cognitoConfig;
    private final AdapterConfig adapterConfig;
    private final OrganisationConfigService organisationConfigService;

    @Autowired
    public DeploymentSpecificConfiguration(CognitoConfig cognitoConfig, AdapterConfig adapterConfig,
                                           UserRepository userRepository, SpringProfiles springProfiles,
                                           AvniKeycloakConfig avniKeycloakConfig, OrganisationConfigService organisationConfigService) {
        this.cognitoConfig = cognitoConfig;
        this.adapterConfig = adapterConfig;
        this.userRepository = userRepository;
        this.springProfiles = springProfiles;
        this.avniKeycloakConfig = avniKeycloakConfig;
        this.organisationConfigService = organisationConfigService;
    }

    @Bean
    public IAMAuthService getAuthService() {
        if (springProfiles.isOnPremise())
            return getKeycloakAuthService();

        if (springProfiles.isStaging())
            return new CognitoAuthServiceImpl(userRepository, cognitoConfig, springProfiles, getKeycloakAuthService());

        return new CognitoAuthServiceImpl(userRepository, cognitoConfig, springProfiles, null);
    }


    private KeycloakAuthService getKeycloakAuthService() {
        return new KeycloakAuthService(userRepository, adapterConfig, springProfiles, avniKeycloakConfig);
    }

    @Profile({"dev", "staging"})
    @Bean("S3Service")
    @Primary
    @Scope(value = "request", proxyMode = ScopedProxyMode.TARGET_CLASS)
    public S3Service getProxiedS3Service() {
        User user = UserContextHolder.getUser();
        Organisation organisation = UserContextHolder.getOrganisation();
        boolean isMinioConfiguredOrgUser = false;
        if (user != null && organisation != null) {
            OrganisationConfig organisationConfig = organisationConfigService.getOrganisationConfig(organisation);
            Object useMinioForStorage = organisationConfig.getConfigValue(OrganisationConfigSettingKey.useMinioForStorage);
            if (useMinioForStorage != null && Boolean.parseBoolean((String) useMinioForStorage)) {
                isMinioConfiguredOrgUser = true;
            }
        }

        if (isMinioConfiguredOrgUser && awsMinioService != null)
            return awsMinioService;

        return getBatchS3Service();
    }

    @Profile({"!dev", "!staging"})
    @Bean("S3Service")
    @Primary
    public S3Service getRegularS3Service() {
        return getBatchS3Service();
    }

    @Profile({"dev"})
    @Bean("IdpService")
    @Primary
    public IdpService getDevIdpService() {
        return cognitoIdpService;
    }

    @Bean("BatchS3Service")
    public S3Service getBatchS3Service() {
        if (springProfiles.isOnPremise() && awsMinioService != null)
            return awsMinioService;

        if (awss3Service != null)
            return awss3Service;

        if (awsMinioService != null)
            return awsMinioService;

        throw new NoSuchBeanDefinitionException("BatchS3Service", "Batch Storage service bean of type BatchS3Service not found");
    }

    @Profile({"staging"})
    @Bean("IdpService")
    @Primary
    @Scope(value = "request", proxyMode = ScopedProxyMode.TARGET_CLASS)
    public IdpService getProxiedIdpService() {
        Organisation organisation = UserContextHolder.getOrganisation();
        return getIdpService(organisation);
    }

    public IdpService getIdpService(Organisation organisation) {
        boolean isKeycloakConfiguredOrgUser = false;
        if (organisation != null) {
            JsonObject organisationSettings = organisationConfigService.getOrganisationSettingsJson(organisation.getId());
            Object useKeycloakAsIDP = organisationSettings.get(OrganisationConfigSettingKey.useKeycloakAsIDP.toString());
            isKeycloakConfiguredOrgUser = (useKeycloakAsIDP != null && Boolean.parseBoolean((String) useKeycloakAsIDP));
        }

        if (isKeycloakConfiguredOrgUser && keycloakIdpService != null)
            return keycloakIdpService;

        if (cognitoIdpService != null)
            return cognitoIdpService;

        if (keycloakIdpService != null)
            return keycloakIdpService;

        throw new NoSuchBeanDefinitionException("IdpService", "Bean of type IdpService not found");
    }

    @Profile({"!dev", "!staging"})
    @Bean("IdpService")
    @Primary
    public IdpService getRegularIdpService() {
        if (springProfiles.isOnPremise() && keycloakIdpService != null)
            return keycloakIdpService;

        if (cognitoIdpService != null)
            return cognitoIdpService;

        if (keycloakIdpService != null)
            return keycloakIdpService;

        throw new NoSuchBeanDefinitionException("RegularIdpService", "Regular Idp service bean of type IdpService not found");
    }

    @Bean("CompositeIDPDetails")
    public AuthDetailsController.CompositeIDPDetails getCompositeIDPDetails() {

        String keycloakGrantType = OAuth2Constants.PASSWORD;
        String keycloakScope = SCOPE;
        String keycloakClientId = keycloakIdpService == null ? null : avniKeycloakConfig.getVerifyTokenAudience();
        String keycloakAuthServerUrl = keycloakIdpService == null ? null : adapterConfig.getAuthServerUrl();
        String cognitoConfigPoolId = cognitoIdpService == null ? null : cognitoConfig.getPoolId();
        String cognitoConfigClientId = cognitoIdpService == null ? null : cognitoConfig.getClientId();
        return new AuthDetailsController.CompositeIDPDetails(keycloakAuthServerUrl, keycloakClientId,
                keycloakGrantType, keycloakScope, cognitoConfigPoolId, cognitoConfigClientId);
    }
}
