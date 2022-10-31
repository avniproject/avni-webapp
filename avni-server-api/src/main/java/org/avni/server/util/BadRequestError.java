package org.avni.server.util;

/*
Throw this exception when you want to rollback the transaction and return bad request error back to client.
Returning HTTP 400 Bad Request on throw of this exception is handled by org.avni.web.ErrorInterceptors.
 */
public class BadRequestError extends RuntimeException {

    public BadRequestError(String format, Object... args) {
        super(String.format(format, args));
    }

}
