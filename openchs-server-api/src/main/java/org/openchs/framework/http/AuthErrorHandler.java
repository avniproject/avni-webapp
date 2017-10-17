package org.openchs.framework.http;

import org.springframework.http.HttpStatus;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.client.DefaultResponseErrorHandler;

import java.io.IOException;

@Component
public class AuthErrorHandler extends DefaultResponseErrorHandler {
    public void handleError(ClientHttpResponse response) throws IOException {
        if (!response.getStatusCode().equals(HttpStatus.BAD_REQUEST)) {
            super.handleError(response);
        }
    }
}
