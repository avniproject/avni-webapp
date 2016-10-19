package org.openchs.server;

import org.openchs.server.framework.spring.SpringConfiguration;
import org.openchs.server.framework.spring.WebSecurityConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Import;

@SpringBootApplication
@Import({SpringConfiguration.class, WebSecurityConfig.class})
@ComponentScan("org.openchs.server")
public class OpenCHS {
    public static void main(String[] args) {
        SpringApplication.run(OpenCHS.class, args);
    }
}