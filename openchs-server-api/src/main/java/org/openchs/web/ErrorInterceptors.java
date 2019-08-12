package org.openchs.web;

import com.bugsnag.Bugsnag;
import com.bugsnag.Report;
import org.openchs.domain.UserContext;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.util.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ErrorInterceptors {
    private final Logger logger;
    private final Bugsnag bugsnag;

    @Autowired
    public ErrorInterceptors(Bugsnag bugsnag) {
        this.logger = LoggerFactory.getLogger(this.getClass());
        this.bugsnag = bugsnag;
    }

    @ExceptionHandler(value = {Exception.class})
    public ResponseEntity<String> unknownException(Exception e) {
        if (e instanceof ApiException) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } else {
            reportToBugsnag(e);
            log(e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    private void log(Exception e) {
        logger.error(e.getMessage(), e);
    }

    private void reportToBugsnag(Exception e) {
        UserContext userContext = UserContextHolder.getUserContext();
        String username = userContext.getUserName();
        String organisationName = userContext.getOrganisationName();
        Report report = bugsnag.buildReport(e).setUser(username, organisationName, username);
        bugsnag.notify(report);
    }
}
