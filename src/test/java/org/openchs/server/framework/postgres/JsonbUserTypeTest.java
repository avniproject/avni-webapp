package org.openchs.server.framework.postgres;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.Test;
import org.openchs.server.domain.KeyValuePairs;

import java.io.IOException;
import java.util.Map;

public class JsonbUserTypeTest {
    @Test
    public void returnedClass() throws IOException {
        TypeReference<Map<String, Object>> typeReference = new KeyValuePairs();
        JsonbUserType.mapper.readValue("{\"names\":[\"Jonh\"],\"interest\":\"Java\",\"domain\":\"JavaCodeGeeks.com\",\"Members\":400}", typeReference);
    }
}