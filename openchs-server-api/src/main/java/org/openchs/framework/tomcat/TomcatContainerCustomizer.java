package org.openchs.framework.tomcat;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.stereotype.Component;

@Component
public class TomcatContainerCustomizer implements WebServerFactoryCustomizer<TomcatServletWebServerFactory> {

    private static final Logger LOGGER = LoggerFactory.getLogger(TomcatContainerCustomizer.class);

    @Override
    public void customize(TomcatServletWebServerFactory factory) {
        if (factory != null) {
            factory.addConnectorCustomizers(connector -> {
                connector.setScheme("https");
                connector.setProxyPort(443);
            });
            LOGGER.info("Enabled secure scheme (https).");
        } else {
            LOGGER.warn("Could not change protocol scheme because Tomcat is not used as servlet container.");
        }
    }
}