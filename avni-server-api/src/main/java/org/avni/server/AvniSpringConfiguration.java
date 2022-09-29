package org.avni.server;

import org.avni.server.domain.User;
import org.avni.server.framework.jpa.CHSAuditorAware;
import org.keycloak.adapters.springboot.KeycloakSpringBootConfigResolver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.web.servlet.WebMvcAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.projection.SpelAwareProxyProjectionFactory;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

@Configuration
@EnableJpaAuditing
@EnableWebMvc
public class AvniSpringConfiguration extends WebMvcAutoConfiguration {
    private final Environment environment;

    @Autowired
    public AvniSpringConfiguration(Environment environment) {
        this.environment = environment;
    }

    @Bean
    public AuditorAware<User> auditorProvider() {
        return new CHSAuditorAware();
    }

    @Bean
    public SpelAwareProxyProjectionFactory projectionFactory() {
        return new SpelAwareProxyProjectionFactory();
    }

    @Bean
    public Boolean isDev() {
        String[] activeProfiles = environment.getActiveProfiles();
        return activeProfiles.length == 1 && (activeProfiles[0].equals("dev") || activeProfiles[0].equals("test"));
    }

    @Bean
    public KeycloakSpringBootConfigResolver keycloakConfigResolver() {
        return new KeycloakSpringBootConfigResolver();
    }
}
