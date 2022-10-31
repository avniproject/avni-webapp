package org.avni.messaging.domain.exception;

import org.springframework.dao.DataAccessException;

public class GlificConnectException extends DataAccessException {
    public GlificConnectException(String msg) {
        super(msg);
    }
}
