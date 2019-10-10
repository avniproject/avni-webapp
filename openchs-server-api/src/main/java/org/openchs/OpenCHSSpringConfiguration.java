package org.openchs;

import org.openchs.dao.UserRepository;
import org.openchs.domain.User;
import org.openchs.framework.jpa.CHSAuditorAware;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.web.servlet.WebMvcAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.projection.SpelAwareProxyProjectionFactory;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

@Configuration
@EnableJpaAuditing
@EnableWebMvc
public class OpenCHSSpringConfiguration extends WebMvcAutoConfiguration {
    private final UserRepository userRepository;

    @Autowired
    public OpenCHSSpringConfiguration(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Bean
    public AuditorAware<User> auditorProvider() {
        return new CHSAuditorAware();
    }

    @Bean
    public SpelAwareProxyProjectionFactory projectionFactory() {
        return new SpelAwareProxyProjectionFactory();
    }
}
