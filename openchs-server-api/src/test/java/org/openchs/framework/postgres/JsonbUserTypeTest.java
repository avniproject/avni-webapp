package org.openchs.framework.postgres;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.Assert;
import org.junit.Test;
import org.openchs.domain.Audit;
import org.openchs.domain.ObservationCollection;
import org.openchs.domain.ProgramEncounter;
import org.openchs.framework.hibernate.AbstractJsonbUserType;
import org.openchs.framework.hibernate.KeyValuePairsHibernateObject;
import org.openchs.util.ObjectMapperSingleton;

import java.io.IOException;
import java.util.Map;

public class JsonbUserTypeTest {
    @Test
    public void returnedClass() throws IOException {
        TypeReference<Map<String, Object>> typeReference = new KeyValuePairsHibernateObject();
        Object value = AbstractJsonbUserType.mapper.readValue("{\"names\":[\"Jonh\"],\"interest\":\"Java\",\"domain\":\"JavaCodeGeeks.com\",\"Members\":400}", typeReference);
    }

    @Test
    public void serialiseObservationCollection() throws JsonProcessingException, JSONException {
        ObservationCollection observations = new ObservationCollection();
        observations.put("a8d3da51-33f8-4b0d-a867-678471603151", 10);
        String string = AbstractJsonbUserType.mapper.writeValueAsString(observations);
        JSONObject jsonObject = new JSONObject(string);
        Assert.assertEquals(10, jsonObject.getInt("a8d3da51-33f8-4b0d-a867-678471603151"));
    }
}