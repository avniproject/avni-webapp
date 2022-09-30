package org.avni.server.framework.postgres;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.Assert;
import org.junit.Test;
import org.avni.server.domain.ObservationCollection;
import org.avni.server.domain.ProgramEncounter;
import org.avni.server.domain.User;
import org.avni.server.framework.hibernate.AbstractJsonbUserType;
import org.avni.server.framework.hibernate.KeyValuePairsHibernateObject;

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
        ProgramEncounter programEncounter = new ProgramEncounter();
        ObservationCollection observations = new ObservationCollection();
        observations.put("a8d3da51-33f8-4b0d-a867-678471603151", 10);
        programEncounter.setCreatedBy(new User());
        programEncounter.setLastModifiedBy(new User());
        programEncounter.setObservations(observations);
        String string = AbstractJsonbUserType.mapper.writeValueAsString(programEncounter);
        JSONObject jsonObject = new JSONObject(string);
        Assert.assertEquals(10, jsonObject.getJSONObject("observations").getInt("a8d3da51-33f8-4b0d-a867-678471603151"));
    }
}
