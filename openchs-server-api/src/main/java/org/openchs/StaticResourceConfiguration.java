package org.openchs;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;


@Configuration
public class StaticResourceConfiguration extends WebMvcConfigurerAdapter {


    @Value("${static.path}")
    private String staticPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        if (staticPath != null) {
            registry
                    .addResourceHandler("/static/**")
                    .addResourceLocations("file:" + staticPath + "static/")
                    .setCacheControl(CacheControl.maxAge(365, TimeUnit.DAYS));
            registry
                    .addResourceHandler("/**")
                    .addResourceLocations("file:" + staticPath);
        }
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("forward:/index.html");
    }
}
