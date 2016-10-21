package org.openchs.web;

import org.junit.Test;
import org.openchs.common.AbstractControllerIntegrationTest;
import org.springframework.http.ResponseEntity;

public class IndividualControllerIntegrationTest extends AbstractControllerIntegrationTest {
    @Test
    public void testGetAll() throws Exception {
        ResponseEntity<String> response = template.getForEntity(base.toString() + "/individual",
                String.class);
        System.out.println(response);
    }
}