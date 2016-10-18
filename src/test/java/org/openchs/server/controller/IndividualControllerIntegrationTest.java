package org.openchs.server.controller;

import org.junit.Test;
import org.springframework.http.ResponseEntity;

public class IndividualControllerIntegrationTest extends AbstractControllerIntegrationTest {
    @Test
    public void getAll() throws Exception {
        ResponseEntity<String> response = template.getForEntity(base.toString() + "/individual",
                String.class);
        System.out.println(response);
    }
}