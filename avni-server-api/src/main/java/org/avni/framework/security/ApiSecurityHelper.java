package org.avni.framework.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.stereotype.Component;

@Component
public class ApiSecurityHelper {
    private final AuthService authService;
    private final Boolean isDev;

    @Value("${avni.defaultUserName}")
    private String defaultUserName;

    @Autowired
    public ApiSecurityHelper(AuthService authService, Boolean isDev) {
        this.authService = authService;
        this.isDev = isDev;
    }

    public void configure(HttpSecurity http, AuthenticationManager authenticationManager) throws Exception {
        http.cors().and().csrf().disable()
                .formLogin().disable()
                .httpBasic().disable()
                .authorizeRequests().anyRequest().permitAll()
                .and()
                .addFilter(new AuthenticationFilter(authenticationManager, authService, isDev, defaultUserName))
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);
    }
}
