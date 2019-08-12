package org.openchs.util;

public class ApiException extends RuntimeException {

    public ApiException(String format, Object... args) {
        super(String.format(format, args));
    }

}