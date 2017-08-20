package org.openchs;

import org.openchs.domain.User;
import org.openchs.framework.jpa.CHSAuditorAware;
import org.springframework.boot.autoconfigure.web.WebMvcAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

@Configuration
@EnableJpaAuditing
@EnableWebMvc
public class OpenCHSSpringConfiguration extends WebMvcAutoConfiguration {
    @Bean
    public AuditorAware<User> auditorProvider() {
        return new CHSAuditorAware();
    }
}