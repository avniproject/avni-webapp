package org.openchs.web;

import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.hamcrest.collection.IsIterableContainingInOrder;
import org.junit.Before;
import org.junit.Test;
import org.mockito.internal.matchers.Contains;
import org.mockito.internal.matchers.StartsWith;
import org.openchs.application.Form;
import org.openchs.application.FormElement;
import org.openchs.application.FormMapping;
import org.openchs.common.AbstractControllerIntegrationTest;
import org.openchs.dao.ConceptRepository;
import org.openchs.dao.ProgramRepository;
import org.openchs.dao.application.FormElementGroupRepository;
import org.openchs.dao.application.FormElementRepository;
import org.openchs.dao.application.FormMappingRepository;
import org.openchs.dao.application.FormRepository;
import org.openchs.domain.Concept;
import org.openchs.domain.ConceptAnswer;
import org.openchs.domain.Program;
import org.openchs.web.request.ConceptContract;
import org.openchs.web.request.application.BasicFormDetails;
import org.openchs.web.request.application.FormContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Sql({"/test-data.sql"})
public class FormControllerIntegrationTest extends AbstractControllerIntegrationTest {
    @Autowired
    private FormMappingRepository formMappingRepository;

    @Autowired
    private ProgramRepository programRepository;

    @Autowired
    private ConceptRepository conceptRepository;

    private Object getJson(String path) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        return mapper.readValue(this.getClass().getResource(path), Object.class);
    }

    @Override
    @Before
    public void setUp() throws Exception {
        super.setUp();
        template.postForEntity("/programs", getJson("/ref/program.json"), Void.class);
        template.postForEntity("/concepts", getJson("/ref/concepts.json"), Void.class);
        template.postForEntity("/forms", getJson("/ref/originalForm.json"), Void.class);
    }

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

    @Test
    public void renameExistingAnswerInFormElement() throws IOException {
        ResponseEntity<FormContract> formResponse = template
                .getForEntity(String.format("/forms/export?formUUID=%s", "0c444bf3-54c3-41e4-8ca9-f0deb8760831"),
                        FormContract.class);
        assertEquals(HttpStatus.OK, formResponse.getStatusCode());
        FormContract form = formResponse.getBody();
        List<ConceptContract> answers = form.getFormElementGroups().get(0).getFormElements().get(0).getConcept().getAnswers();
        for (ConceptContract answer : answers) {
            if (answer.getUuid().equals("28e76608-dddd-4914-bd44-3689eccfa5ca")) {
                assertEquals("Yes, started", answer.getName());
            }
        }
        template.postForEntity("/forms", getJson("/ref/formWithRenamedAnswer.json"), Void.class);
        formResponse = template
                .getForEntity(String.format("/forms/export?formUUID=%s", "0c444bf3-54c3-41e4-8ca9-f0deb8760831"),
                        FormContract.class);
        assertEquals(HttpStatus.OK, formResponse.getStatusCode());
        form = formResponse.getBody();
        answers = form.getFormElementGroups().get(0).getFormElements().get(0).getConcept().getAnswers();
        for (ConceptContract answer : answers) {
            if (answer.getUuid().equals("28e76608-dddd-4914-bd44-3689eccfa5ca")) {
                assertEquals("Yes Started", answer.getName());
            }
        }
    }

    @Test
    public void deleteExistingAnswerInFormElement() throws IOException {
        ResponseEntity<FormContract> formResponse = template
                .getForEntity(String.format("/forms/export?formUUID=%s", "0c444bf3-54c3-41e4-8ca9-f0deb8760831"),
                        FormContract.class);
        assertEquals(HttpStatus.OK, formResponse.getStatusCode());
        FormContract form = formResponse.getBody();
        List<ConceptContract> answers = form.getFormElementGroups().get(0).getFormElements().get(0).getConcept().getAnswers();
        List<String> answerUUIDs = new ArrayList<>();
        for (ConceptContract answer : answers) {
            answerUUIDs.add(answer.getUuid());
        }
        assertEquals(3, answers.size());
        assertTrue(answerUUIDs.contains("28e76608-dddd-4914-bd44-3689eccfa5ca"));
        template.postForEntity("/forms", getJson("/ref/formWithDeletedAnswer.json"), Void.class);

        formResponse = template
                .getForEntity(String.format("/forms/export?formUUID=%s", "0c444bf3-54c3-41e4-8ca9-f0deb8760831"),
                        FormContract.class);

        assertEquals(HttpStatus.OK, formResponse.getStatusCode());
        form = formResponse.getBody();
        answers = form.getFormElementGroups().get(0).getFormElements().get(0).getConcept().getAnswers();
        answerUUIDs = new ArrayList<>();
        for (ConceptContract answer : answers) {
            answerUUIDs.add(answer.getUuid());
        }
        assertEquals(2, answers.size());
        assertFalse(answerUUIDs.contains("28e76608-dddd-4914-bd44-3689eccfa5ca"));
    }

    @Test
    public void changingOrderOfAllAnswers() throws IOException {
        Concept codedConcept = conceptRepository.findByUuid("dcfc771a-0785-43be-bcb1-0d2755793e0e");
        Set<ConceptAnswer> conceptAnswers = codedConcept.getConceptAnswers();
        conceptAnswers.forEach(conceptAnswer -> {
            switch (conceptAnswer.getOrder()) {
                case 1:
                    assertEquals("28e76608-dddd-4914-bd44-3689eccfa5ca", conceptAnswer.getAnswerConcept().getUuid());
                    break;
                case 2:
                    assertEquals("9715936e-03f2-44da-900f-33588fe95250", conceptAnswer.getAnswerConcept().getUuid());
                    break;
                case 3:
                    assertEquals("e7b50c78-3d90-484d-a224-9887887780dc", conceptAnswer.getAnswerConcept().getUuid());
                    break;
            }

        });
        template.postForEntity("/forms", getJson("/ref/formWithChangedAnswerOrder.json"), Void.class);
        codedConcept = conceptRepository.findByUuid("dcfc771a-0785-43be-bcb1-0d2755793e0e");
        conceptAnswers = codedConcept.getConceptAnswers();
        conceptAnswers.forEach(conceptAnswer -> {
            switch (conceptAnswer.getOrder()) {
                case 1:
                    assertEquals("9715936e-03f2-44da-900f-33588fe95250", conceptAnswer.getAnswerConcept().getUuid());
                    break;
                case 2:
                    assertEquals("28e76608-dddd-4914-bd44-3689eccfa5ca", conceptAnswer.getAnswerConcept().getUuid());
                    break;
                case 3:
                    assertEquals("e7b50c78-3d90-484d-a224-9887887780dc", conceptAnswer.getAnswerConcept().getUuid());
                    break;
            }

        });

    }
}