package org.openchs.framework.security;

import org.openchs.service.UserContextService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)
@EnableWebSecurity(debug = false)
public class ApiSecurity extends WebSecurityConfigurerAdapter {

    private final UserContextService userContextService;

    private final Environment environment;

    @Autowired
    public ApiSecurity(UserContextService userContextService, Environment environment) {
        this.userContextService = userContextService;
        this.environment = environment;
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        super.configure(http);
        http = setSecure(http);
        http.cors().and().csrf().disable()
                .formLogin().disable()
                .httpBasic().disable()
                .authorizeRequests().anyRequest().permitAll()
                .and()
                .addFilter(new AuthenticationFilter(authenticationManager(), userContextService))
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);
    }

    private HttpSecurity setSecure(HttpSecurity http) throws Exception {
        List<String> profiles = Arrays.asList(environment.getActiveProfiles());
        if (!(profiles.contains("dev") || profiles.contains("test"))) {
            http.requiresChannel().anyRequest().requiresSecure();
        }
        return http;
    }

}
