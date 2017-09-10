package org.openchs.web;

import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.*;
import static org.mockito.Matchers.contains;
import static org.mockito.Matchers.startsWith;

import org.junit.Test;
import org.mockito.internal.matchers.Contains;
import org.mockito.internal.matchers.StartsWith;
import org.openchs.application.FormMapping;
import org.openchs.common.AbstractControllerIntegrationTest;
import org.openchs.dao.application.FormMappingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.jdbc.Sql;

@Sql({"/test-data.sql"})
public class FormControllerIntegrationTest extends AbstractControllerIntegrationTest {
    @Autowired
    private FormMappingRepository formMappingRepository;

    @Test
    public void findByEntityId() {
        Page<FormMapping> fmPage = formMappingRepository.findByEntityId(1L, new PageRequest(0, 1));
        assertEquals(1, fmPage.getContent().size());
    }

    @Test
    public void getForms() {
        ResponseEntity<String> response = template.getForEntity("/forms/program/1", String.class);
        assertThat(response.getStatusCode(), equalTo(HttpStatus.OK));
        assertThat("Invalid JSON", response.getBody(),
                new StartsWith("[{\"name\":\"encounter_form\",\"uuid\":\"2c32a184-6d27-4c51-841d-551ca94594a5\",\"formType\":\"Encounter\",\"programName\":\"Diabetes\""));
        assertThat(response.getBody(), new Contains("\"links\":[{\"rel\":\"self\""));
        assertThat(response.getBody(), new Contains("{\"rel\":\"form\""));
        assertThat(response.getBody(), new Contains("{\"rel\":\"formElementGroups\""));
        assertThat(response.getBody(), new Contains("{\"rel\":\"createdBy\""));
        assertThat(response.getBody(), new Contains("{\"rel\":\"lastModifiedBy\""));
    }
}