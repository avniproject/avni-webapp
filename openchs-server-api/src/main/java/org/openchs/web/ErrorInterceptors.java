package org.openchs.web;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import javax.servlet.http.HttpServletResponse;

import com.bugsnag.Bugsnag;

@RestControllerAdvice
public class ErrorInterceptors {
    private final Logger logger;
    private final Bugsnag bugsnag;

    @Autowired
    private Environment environment;

    public ErrorInterceptors() {
        this.logger = LoggerFactory.getLogger(this.getClass());
        bugsnag = new Bugsnag(environment.getProperty("OPENCHS_SERVER_BUGSNAG_API_KEY"));
    }

    @ExceptionHandler(value = {Exception.class})
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseEntity<String> unknownException(Exception e, WebRequest req, HttpServletResponse res) {
        if(!isDev()) {
            bugsnag.notify(e);
        }
        logger.error(e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
    }

    private boolean isDev() {
        String[] activeProfiles = environment.getActiveProfiles();
        return activeProfiles.length == 1 && (activeProfiles[0].equals("dev") || activeProfiles[0].equals("test"));
    }
}
