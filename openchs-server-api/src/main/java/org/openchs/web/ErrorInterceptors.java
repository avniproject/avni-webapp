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
    public ErrorInterceptors(Environment environment) {
        this.logger = LoggerFactory.getLogger(this.getClass());
        String bugsnagAPIKey = environment.getProperty("openchs.bugsnag.apiKey");
        String bugsnagReleaseStage = environment.getProperty("openchs.bugsnag.releaseStage");
        logger.info(String.format("bugsnagAPIKey is: %s", bugsnagAPIKey));
        logger.info(String.format("bugsnagReleaseStage is: %s", bugsnagReleaseStage));
        bugsnag = new Bugsnag(bugsnagAPIKey, false);
        bugsnag.setReleaseStage(bugsnagReleaseStage);
        bugsnag.setNotifyReleaseStages("prod", "staging");
    }

    @ExceptionHandler(value = {Exception.class})
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseEntity<String> unknownException(Exception e, WebRequest req, HttpServletResponse res) {
        bugsnag.notify(e);
        logger.error(e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
    }
}
