package org.avni.server;

import org.avni.server.domain.User;
import org.avni.server.framework.jpa.CHSAuditorAware;
import org.keycloak.adapters.springboot.KeycloakSpringBootConfigResolver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.web.servlet.WebMvcAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.projection.SpelAwareProxyProjectionFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import javax.sql.DataSource;

@Configuration
@EnableJpaAuditing
@EnableWebMvc
public class AvniSpringConfiguration extends WebMvcAutoConfiguration {
    private final Environment environment;
    private final DataSource dataSource;
    @Value("${avni.custom.query.timeout}")
    private int timeout;

    @Value("${avni.custom.query.max.rows}")
    private int maxRows;

    @Autowired
    public AvniSpringConfiguration(Environment environment, @Qualifier("dataSource") DataSource dataSource) {
        this.environment = environment;
        this.dataSource = dataSource;
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

    @Bean(name = "externalQueryJdbcTemplate")
    public NamedParameterJdbcTemplate getExternalQueryJdbcTemplate() {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        jdbcTemplate.setQueryTimeout(timeout);
        jdbcTemplate.setMaxRows(maxRows);
        return new NamedParameterJdbcTemplate(jdbcTemplate);
    }

    @Bean
    public KeycloakSpringBootConfigResolver keycloakConfigResolver() {
        return new KeycloakSpringBootConfigResolver();
    }
}
