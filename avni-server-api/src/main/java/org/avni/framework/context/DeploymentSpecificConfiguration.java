package org.avni.framework.context;

import org.avni.config.CognitoConfig;
import org.avni.config.KeycloakConfig;
import org.avni.dao.UserRepository;
import org.avni.domain.Organisation;
import org.avni.domain.User;
import org.avni.framework.security.UserContextHolder;
import org.avni.service.*;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.*;

@Configuration
public class DeploymentSpecificConfiguration {

    @Qualifier("AWSS3Service")
    @Autowired(required = false)
    private AWSS3Service awss3Service;

    @Qualifier("MinioService")
    @Autowired(required = false)
    private MinioService minioService;

    private final UserRepository userRepository;
    private final SpringProfiles springProfiles;
    private final CognitoConfig cognitoConfig;
    private final KeycloakConfig keycloakConfig;

    @Autowired
    public DeploymentSpecificConfiguration(CognitoConfig cognitoConfig, KeycloakConfig keycloakConfig,
                                           UserRepository userRepository, SpringProfiles springProfiles) {
        this.cognitoConfig = cognitoConfig;
        this.keycloakConfig = keycloakConfig;
        this.userRepository = userRepository;
        this.springProfiles = springProfiles;
    }

    @Bean
    public IAMAuthService getAuthService() {
        if (springProfiles.isOnPremise())
            return getKeycloakAuthService();

        if (springProfiles.isStaging())
            return new CognitoAuthServiceImpl(userRepository, cognitoConfig, springProfiles, getKeycloakAuthService());

        return new CognitoAuthServiceImpl(userRepository, cognitoConfig, springProfiles, null);
    }

    @Bean("S3Service")
    @Primary
    @Scope(value = "request", proxyMode = ScopedProxyMode.TARGET_CLASS)
    public S3Service getS3Service() {
        User user = UserContextHolder.getUser();
        Organisation organisation = UserContextHolder.getOrganisation();
        boolean isMinioConfiguredOrgUser = false;
        if(user != null && organisation != null) {
            //TODO use User settings to init this variable
            isMinioConfiguredOrgUser = springProfiles.isStaging();
        }

        if (springProfiles.isOnPremise() && minioService != null)
            return minioService;

        if (springProfiles.isStaging() && isMinioConfiguredOrgUser && minioService != null)
            return minioService;

        if(awss3Service != null)
            return awss3Service;

        if(minioService != null)
            return minioService;

        throw new NoSuchBeanDefinitionException("S3Service", "Storage service bean of type S3Service not found");
    }

    private KeycloakAuthService getKeycloakAuthService() {
        return new KeycloakAuthService(userRepository, keycloakConfig, springProfiles);
    }
}
