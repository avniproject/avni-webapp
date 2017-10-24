package org.openchs.framework.security;

import org.openchs.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;

@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)
@EnableWebSecurity(debug = false)
public class ApiSecurity extends WebSecurityConfigurerAdapter {

    private final AuthService authService;

    @Autowired
    public ApiSecurity(AuthService authService) {
        this.authService = authService;
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        super.configure(http);
        http.cors().and().csrf().disable()
                .formLogin().disable()
                .httpBasic().disable()
                .authorizeRequests().anyRequest().permitAll()
                .and()
                .addFilter(new AuthenticationFilter(authenticationManager(), authService))
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);
    }

}
