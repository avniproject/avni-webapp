package org.openchs.framework.http;

import org.springframework.http.HttpStatus;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.client.DefaultResponseErrorHandler;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
public class AuthErrorHandler extends DefaultResponseErrorHandler {

    private static final List<HttpStatus> KNOWN_BAD_STATUSES = Arrays.asList(HttpStatus.BAD_REQUEST, HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN, HttpStatus.OK, HttpStatus.CREATED);

    @Override
    public boolean hasError(ClientHttpResponse response) throws IOException {
        return !KNOWN_BAD_STATUSES.contains(response.getStatusCode());
    }
}
