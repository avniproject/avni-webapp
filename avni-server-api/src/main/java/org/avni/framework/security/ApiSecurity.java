package org.avni.framework.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)
@EnableWebSecurity(debug = false)
@Order(Ordered.LOWEST_PRECEDENCE)
@ConditionalOnProperty(prefix = "avni", name = "iam", havingValue = "cognito")
public class ApiSecurity extends WebSecurityConfigurerAdapter {
    private final ApiSecurityHelper apiSecurityHelper;

    @Autowired
    public ApiSecurity(ApiSecurityHelper apiSecurityHelper) {
        this.apiSecurityHelper = apiSecurityHelper;
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        super.configure(http);
        apiSecurityHelper.configure(http, authenticationManager());
    }
}
