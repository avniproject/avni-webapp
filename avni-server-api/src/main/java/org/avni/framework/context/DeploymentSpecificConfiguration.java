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
    private final Boolean isDev;
    private final SpringProfiles springProfiles;
    private final CognitoConfig cognitoConfig;
    private final KeycloakConfig keycloakConfig;

    @Autowired
    public DeploymentSpecificConfiguration(CognitoConfig cognitoConfig, KeycloakConfig keycloakConfig, UserRepository userRepository, Boolean isDev, SpringProfiles springProfiles) {
        this.cognitoConfig = cognitoConfig;
        this.keycloakConfig = keycloakConfig;
        this.userRepository = userRepository;
        this.isDev = isDev;
        this.springProfiles = springProfiles;
    }

    @Bean
    public IAMAuthService getAuthService() {
        if (springProfiles.isOnPremise())
            return new KeycloakAuthService(userRepository, keycloakConfig, isDev);

        return new CognitoAuthServiceImpl(userRepository, isDev, cognitoConfig);
    }
}
