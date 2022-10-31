package org.avni.server.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.joda.JodaModule;

public final class ObjectMapperSingleton {
    private static final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JodaModule());

    private ObjectMapperSingleton() {
    }

    public static ObjectMapper getObjectMapper() {
        return objectMapper;
    }
}
