package org.avni.web;

import org.junit.Before;
import org.junit.Test;
import org.avni.server.application.FormMapping;
import org.avni.server.dao.application.FormMappingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assert.assertEquals;

@Sql({"/test-data.sql"})
public class FormMappingsIntegrationTest extends AbstractControllerIntegrationTest {
    @Autowired
    private FormMappingRepository formMappingRepository;

    private void post(Object json) {
        super.post("/formMappings", json);
    }

    @Override
    @Before
    public void setUp() throws Exception {
        super.setUp();
        setUser("demo-admin");
        post("/concepts", getJSON("/ref/concepts.json"));
        post("/encounterTypes", getJSON("/ref/encounterTypes/encounterTypes.json"));
        post("/forms", getJSON("/ref/forms/originalForm.json"));
        post("/programs", getJSON("/ref/program.json"));
    }


    @Test
    public void shouldCreateFormMappings() throws IOException {
        Object json = getJSON("/ref/formMappings/formMappings.json");
        post(json);

        FormMapping formMapping = formMappingRepository.findByUuid("bc253834-9e6f-4bc5-ac1e-73aca27d4c53");
        assertThat(formMapping).isNotNull();
        assertEquals(formMapping.getForm().getName(), "Adolescent School Dropout Followup");
        assertThat(formMapping.getProgram().getId()).isEqualTo(1);
        assertThat(formMapping.getEncounterType().getId()).isEqualTo(1);
    }

    @Test
    public void shouldVoidAFormMapping() throws IOException {
        Object json = getJSON("/ref/formMappings/voidableFormMapping.json");
        post(json);

        FormMapping voidableEncounterType = formMappingRepository.findByUuid("d5f7c308-17f3-4896-a276-1dec611b2571");
        assertThat(voidableEncounterType).isNotNull();
        assertThat(voidableEncounterType.isVoided()).isFalse();

        json = getJSON("/ref/formMappings/voidedFormMapping.json");
        post(json);
        FormMapping voidedEncounterType = formMappingRepository.findByUuid("d5f7c308-17f3-4896-a276-1dec611b2571");
        assertThat(voidedEncounterType).isNotNull();
        assertThat(voidedEncounterType.isVoided()).isTrue();
    }

    private Object getJSON(String jsonFile) throws IOException {
        return mapper.readValue(this.getClass().getResource(jsonFile), Object.class);
    }
}
