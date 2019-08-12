package org.openchs.web;

import com.bugsnag.Bugsnag;
import com.bugsnag.Report;
import org.openchs.domain.UserContext;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.util.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class ErrorInterceptors extends ResponseEntityExceptionHandler {
    class ApiError {
        private String field;
        private String message;

        public ApiError(String field, String message) {
            this.field = field;
            this.message = message;
        }

        public String getField() {
            return field;
        }

        public void setField(String field) {
            this.field = field;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

    private final Logger logger;
    private final Bugsnag bugsnag;

    @Autowired
    public ErrorInterceptors(Bugsnag bugsnag) {
        this.logger = LoggerFactory.getLogger(this.getClass());
        this.bugsnag = bugsnag;
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatus status, WebRequest request) {
        Map<String, Object> body = new HashMap<>();
        List<ApiError> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(x -> new ApiError(x.getField(), x.getDefaultMessage()))
                .collect(Collectors.toList());
        body.put("errors", errors);
        return new ResponseEntity<>(body, headers, status);
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
