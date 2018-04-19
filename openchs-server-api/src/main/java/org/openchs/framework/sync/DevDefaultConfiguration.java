package org.openchs.framework.sync;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.web.servlet.handler.MappedInterceptor;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@Profile({"dev"})
@Order(Ordered.HIGHEST_PRECEDENCE)
public class DevDefaultConfiguration extends WebMvcConfigurerAdapter {
    private final CatchmentDefaultInterceptor catchmentDefaultInterceptor;

    @Autowired
    public DevDefaultConfiguration(CatchmentDefaultInterceptor catchmentDefaultInterceptor) {
        this.catchmentDefaultInterceptor = catchmentDefaultInterceptor;
    }

    @Bean("mappedCatchmentDefaultInterceptor")
    @Profile("dev")
    public MappedInterceptor mappedCatchmentDefaultInterceptor() {
        return new MappedInterceptor(new String[]{"/**"}, catchmentDefaultInterceptor);
    }
}
