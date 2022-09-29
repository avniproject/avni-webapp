package org.avni.web;

import org.junit.Before;
import org.junit.Test;
import org.avni.server.dao.ConceptRepository;
import org.avni.server.domain.Concept;
import org.avni.server.domain.ConceptDataType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;

@Sql({"/test-data.sql"})
public class ConceptControllerIntegrationTest extends AbstractControllerIntegrationTest {
    @Autowired
    private ConceptRepository conceptRepository;

    private void post(Object json) {
        super.post("/concepts", json);
    }

    @Before
    public void setUp() throws Exception {
        super.setUp();
        setUser("demo-admin");
    }

    @Test
    public void shouldCreateConcepts() throws IOException {
        Object json = getJSON("/ref/concepts/concepts.json");
        post(json);

        Concept naConcept = conceptRepository.findByUuid("b82d4ed8-6e9f-4c67-bfdc-b1a04861bc20");
        assertThat(naConcept).isNotNull();
        assertThat(naConcept.getName()).isEqualTo("NA concept");
    }

    @Test
    public void shouldCreateConceptsWithOneLevelNesting() throws IOException {
        Object json = getJSON("/ref/concepts/codedConceptsWithOneLevelNesting.json");
        post(json);

        Concept nestedConcept = conceptRepository.findByUuid("0ca1c6a2-001b-475a-9813-1d905df9e81b");
        assertThat(nestedConcept).isNotNull();
        assertThat(nestedConcept.getName()).isEqualTo("High Risk Conditions");
    }

    @Test
    public void shouldFailToCreateConceptsWithMultipleNesting() throws IOException {

        try {
            Object json = getJSON("/ref/concepts/codedConceptsWithMultipleNesting.json");
            post(json);
            assertThat(false);
        } catch (AssertionError e) {
            assertThat(e.getMessage()).isEqualTo("Answer concept not found for UUID:781aa33a-2bb0-45ed-b00e-d344186d9824");
        }
    }

    @Test
    public void shouldVoidAConcept() throws IOException {
        Object json = getJSON("/ref/concepts/voidableConcept.json");
        post(json);

        Concept voidableConcept = conceptRepository.findByName("Voidable concept");
        assertThat(voidableConcept).isNotNull();
        assertThat(voidableConcept.isVoided()).isFalse();

        json = getJSON("/ref/concepts/voidedConcept.json");
        post(json);
        Concept voidedConcept = conceptRepository.findByName("Voidable concept");
        assertThat(voidedConcept).isNotNull();
        assertThat(voidedConcept.isVoided()).isTrue();
    }

    @Test
    public void shouldAddAnswersAlongWithExistingAnswers() throws IOException {
        Object json = getJSON("/ref/concepts/codedConcept.json");
        post(json);

        Concept codedConcept = conceptRepository.findByName("Coded Question");
        assertThat(codedConcept).isNotNull();
        assertThat(codedConcept.getConceptAnswers().size()).isEqualTo(3);

        json = getJSON("/ref/concepts/addAnswers.json");
        post(json);

        Concept withAnswer4 = conceptRepository.findByName("Coded Question");
        assertThat(withAnswer4).isNotNull();
        assertThat(withAnswer4.getConceptAnswers().size()).isEqualTo(4);

    }

    @Test
    public void donotChangeTheDataTypeOfConceptUsedAsAnswerIfAlreadyPresent() throws IOException {
        Object json = getJSON("/ref/concepts/conceptUsedAsCodedButAlsoAsAnswer.json");
        post(json);
        assertThat(conceptRepository.findByUuid("d78edcbb-2034-4220-ace2-20b445a1e0ad").getDataType()).isEqualTo(ConceptDataType.Coded.toString());
        assertThat(conceptRepository.findByUuid("60f284a6-0240-4de8-a6a1-8839bc9cc219").getDataType()).isEqualTo(ConceptDataType.Numeric.toString());
        post(json);
        assertThat(conceptRepository.findByUuid("d78edcbb-2034-4220-ace2-20b445a1e0ad").getDataType()).isEqualTo(ConceptDataType.Coded.toString());
        assertThat(conceptRepository.findByUuid("60f284a6-0240-4de8-a6a1-8839bc9cc219").getDataType()).isEqualTo(ConceptDataType.Numeric.toString());
    }

    @Test
    public void addConceptAnswerViaRedefiningTheConcept() throws IOException {
        Object json = getJSON("/ref/concepts/conceptsAnswersAddedBySpecifyingNewOnesOnly.json");
        post(json);
        assertThat(conceptRepository.findByUuid("d76927d0-a0b9-4cb0-be29-12508275036e").getConceptAnswers().size()).isEqualTo(3);

        json = getJSON("/ref/concepts/conceptAnswerAdditionViaSeparateFile.json");
        post(json);
        assertThat(conceptRepository.findByUuid("d76927d0-a0b9-4cb0-be29-12508275036e").getConceptAnswers().size()).isEqualTo(4);
    }

    private Object getJSON(String jsonFile) throws IOException {
        return mapper.readValue(this.getClass().getResource(jsonFile), Object.class);
    }
}
