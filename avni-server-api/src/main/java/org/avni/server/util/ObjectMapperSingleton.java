package org.avni.server.util;

import com.fasterxml.jackson.databind.ObjectMapper;

public final class ObjectMapperSingleton {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    private ObjectMapperSingleton() {
    }

    public static ObjectMapper getObjectMapper() {
        return objectMapper;
    }
}
