package org.openchs.web;

import org.junit.Test;
import org.openchs.common.AbstractControllerIntegrationTest;
import org.openchs.dao.ConceptRepository;
import org.openchs.domain.Concept;
import org.openchs.domain.ConceptAnswer;
import org.openchs.domain.ConceptDataType;
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

    @Test
    public void shouldCreateConcepts() throws IOException {
        Object json = mapper.readValue(this.getClass().getResource("/ref/concepts/concepts.json"), Object.class);
        post(json);

        Concept naConcept = conceptRepository.findByUuid("b82d4ed8-6e9f-4c67-bfdc-b1a04861bc20");
        assertThat(naConcept).isNotNull();
        assertThat(naConcept.getName()).isEqualTo("NA concept");
    }

    @Test
    public void shouldVoidAConcept() throws IOException {
        Object json = mapper.readValue(this.getClass().getResource("/ref/concepts/voidableConcept.json"), Object.class);
        post(json);

        Concept voidableConcept = conceptRepository.findByName("Voidable concept");
        assertThat(voidableConcept).isNotNull();
        assertThat(voidableConcept.isVoided()).isFalse();

        json = mapper.readValue(this.getClass().getResource("/ref/concepts/voidedConcept.json"), Object.class);
        post(json);
        Concept voidedConcept = conceptRepository.findByName("Voidable concept");
        assertThat(voidedConcept).isNotNull();
        assertThat(voidedConcept.isVoided()).isTrue();
    }

    @Test
    public void shouldAddAndRemoveAnswers() throws IOException {
        Object json = mapper.readValue(this.getClass().getResource("/ref/concepts/codedConcept.json"), Object.class);
        post(json);

        Concept codedConcept = conceptRepository.findByName("Coded Question");
        assertThat(codedConcept).isNotNull();
        assertThat(codedConcept.getConceptAnswers().size()).isEqualTo(3);

        json = mapper.readValue(this.getClass().getResource("/ref/concepts/addAnswers.json"), Object.class);
        post(json);

        Concept withAnswer4 = conceptRepository.findByName("Coded Question");
        assertThat(withAnswer4).isNotNull();
        assertThat(withAnswer4.getConceptAnswers().size()).isEqualTo(4);

        json = mapper.readValue(this.getClass().getResource("/ref/concepts/removeAnswers.json"), Object.class);
        post(json);

        Concept withoutAnswer3 = conceptRepository.findByName("Coded Question");
        assertThat(withoutAnswer3).isNotNull();
        assertThat(withoutAnswer3.getConceptAnswers().size()).isEqualTo(4);
        ConceptAnswer removedConceptAnswer = withoutAnswer3.getConceptAnswers().stream().filter(conceptAnswer -> conceptAnswer.getAnswerConcept().getName().equals("Coded Answer 3")).findFirst().get();
        assertThat(removedConceptAnswer).isNotNull();
        assertThat((removedConceptAnswer).isVoided()).isTrue();
    }

    @Test
    public void donotChangeTheDataTypeOfConceptUsedAsAnswerIfAlreadyPresent() throws IOException {
        Object json = mapper.readValue(this.getClass().getResource("/ref/concepts/conceptUsedAsCodedButAlsoAsAnswer.json"), Object.class);
        post(json);
        assertThat(conceptRepository.findByUuid("d78edcbb-2034-4220-ace2-20b445a1e0ad").getDataType()).isEqualTo(ConceptDataType.Coded.toString());
        assertThat(conceptRepository.findByUuid("60f284a6-0240-4de8-a6a1-8839bc9cc219").getDataType()).isEqualTo(ConceptDataType.Numeric.toString());
        post(json);
        assertThat(conceptRepository.findByUuid("d78edcbb-2034-4220-ace2-20b445a1e0ad").getDataType()).isEqualTo(ConceptDataType.Coded.toString());
        assertThat(conceptRepository.findByUuid("60f284a6-0240-4de8-a6a1-8839bc9cc219").getDataType()).isEqualTo(ConceptDataType.Numeric.toString());
    }
}