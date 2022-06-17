package org.avni.framework.context;

import org.avni.config.CognitoConfig;
import org.avni.config.KeycloakConfig;
import org.avni.dao.UserRepository;
import org.avni.service.CognitoAuthServiceImpl;
import org.avni.service.IAMAuthService;
import org.avni.service.KeycloakAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DeploymentSpecificConfiguration {
    private final UserRepository userRepository;
    private final SpringProfiles springProfiles;
    private final CognitoConfig cognitoConfig;
    private final KeycloakConfig keycloakConfig;

    @Autowired
    public DeploymentSpecificConfiguration(CognitoConfig cognitoConfig, KeycloakConfig keycloakConfig, UserRepository userRepository, SpringProfiles springProfiles) {
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

    private KeycloakAuthService getKeycloakAuthService() {
        return new KeycloakAuthService(userRepository, keycloakConfig, springProfiles);
    }
}
