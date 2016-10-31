package org.openchs.framework.jpa;

import org.openchs.domain.User;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaAuditing
public class JPAConfiguration {
    @Bean
    public AuditorAware<User> auditorProvider() {
        return new CHSAuditorAware();
    }
}