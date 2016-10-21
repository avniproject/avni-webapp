package org.openchs.framework.postgres;

import com.fasterxml.jackson.core.type.TypeReference;
import org.junit.Test;
import org.openchs.framework.hibernate.AbstractJsonbUserType;
import org.openchs.framework.hibernate.KeyValuePairsHibernateObject;

import java.io.IOException;
import java.util.Map;

public class JsonbUserTypeTest {
    @Test
    public void returnedClass() throws IOException {
        TypeReference<Map<String, Object>> typeReference = new KeyValuePairsHibernateObject();
        Object value = AbstractJsonbUserType.mapper.readValue("{\"names\":[\"Jonh\"],\"interest\":\"Java\",\"domain\":\"JavaCodeGeeks.com\",\"Members\":400}", typeReference);
        System.out.println(value);
    }
}