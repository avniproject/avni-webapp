package org.openchs.web;

import org.junit.Test;
import org.openchs.common.AbstractControllerIntegrationTest;
import org.openchs.domain.Concept;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

public class ConceptControllerIntegrationTest extends AbstractControllerIntegrationTest {
    @Test
    public void create() {
        Concept concept = Concept.create("test", "Numeric");
        ResponseEntity<Void> responseEntity = template.postForEntity(base.toString() + "/concept", concept, Void.class);
        assertThat(responseEntity.getStatusCode()).as(responseEntity.toString()).isEqualTo(HttpStatus.CREATED);
    }
}