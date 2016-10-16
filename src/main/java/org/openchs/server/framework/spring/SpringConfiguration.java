package org.openchs.server.framework.spring;

import org.openchs.server.domain.User;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaAuditing
public class SpringConfiguration {
    @Bean
    public AuditorAware<User> auditorProvider() {
        return new SpringSecurityAuditorAware();
    }
}