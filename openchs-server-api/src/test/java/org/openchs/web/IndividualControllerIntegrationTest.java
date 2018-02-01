package org.openchs.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.Test;
import org.openchs.common.AbstractControllerIntegrationTest;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.UUID;
import java.util.stream.IntStream;

@Sql({"/test-data.sql"})
public class IndividualControllerIntegrationTest extends AbstractControllerIntegrationTest {
    @Test
    public void testGetAll() throws Exception {
        ResponseEntity<String> response = template.getForEntity(base.toString() + "/individual",
                String.class);
    }

    //There are no asserts here. This is uncommented just to make sure it does not break over time.
    //Requests to save a resource in an organisation will be run one after another
    @Test
    public void testParallelSave() {
        IntStream.range(1, 10).parallel().forEach(value -> {
            ObjectMapper mapper = new ObjectMapper();
            try {
                Object json = mapper.readValue(this.getClass().getResource("/ref/individual.json"), Object.class);
                ((LinkedHashMap)json).put("uuid", UUID.randomUUID());
                template.postForEntity("/individuals", json, Void.class);
            } catch (IOException e) {
                e.printStackTrace();
            }
        });
    }
}