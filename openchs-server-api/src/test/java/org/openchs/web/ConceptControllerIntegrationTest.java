package org.openchs.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.Assert;
import org.junit.Test;
import org.openchs.common.AbstractControllerIntegrationTest;
import org.openchs.dao.ConceptRepository;
import org.openchs.domain.Concept;
import org.openchs.domain.ConceptAnswer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;

@Sql({"/test-data.sql"})
public class ConceptControllerIntegrationTest extends AbstractControllerIntegrationTest {

    @Autowired
    private ConceptRepository conceptRepository;

    public ConceptControllerIntegrationTest() {
    }

    @Test
    public void shouldCreateConcepts() {
        ObjectMapper mapper = new ObjectMapper();
        try {
            Object json = mapper.readValue(this.getClass().getResource("/ref/concepts/concepts.json"), Object.class);
            template.postForEntity("/concepts", json, Void.class);

            Concept naConcept = conceptRepository.findByUuid("b82d4ed8-6e9f-4c67-bfdc-b1a04861bc20");
            assertThat(naConcept).isNotNull();
            assertThat(naConcept.getName()).isEqualTo("NA concept");


            assertThat(conceptRepository.findByUuid("c4e3facf-7594-434b-80d9-01b694758afc")).isNotNull();
            Concept voidedConcept = conceptRepository.findByUuid("31f1d3e9-d1e0-4645-947f-8b9fcaa17e01");
            assertThat(voidedConcept).isNotNull();
            assertThat(voidedConcept.isVoided()).isTrue();

        } catch (IOException e) {
            Assert.fail();
        }
    }

    @Test
    public void shouldVoidAConcept() {
        ObjectMapper mapper = new ObjectMapper();
        try {
            Object json = mapper.readValue(this.getClass().getResource("/ref/concepts/voidableConcept.json"), Object.class);
            template.postForEntity("/concepts", json, Void.class);

            Concept voidableConcept = conceptRepository.findByName("Voidable concept");
            assertThat(voidableConcept).isNotNull();
            assertThat(voidableConcept.isVoided()).isFalse();

            json = mapper.readValue(this.getClass().getResource("/ref/concepts/voidedConcept.json"), Object.class);
            template.postForEntity("/concepts", json, Void.class);
            Concept voidedConcept = conceptRepository.findByName("Voidable concept");
            assertThat(voidedConcept).isNotNull();
            assertThat(voidedConcept.isVoided()).isTrue();

        } catch (IOException e) {
            Assert.fail();
        }
    }

    @Test
    public void shouldAddAndRemoveAnswers() {
        ObjectMapper mapper = new ObjectMapper();
        try {
            Object json = mapper.readValue(this.getClass().getResource("/ref/concepts/codedConcept.json"), Object.class);
            template.postForEntity("/concepts", json, Void.class);

            Concept codedConcept = conceptRepository.findByName("Coded Question");
            assertThat(codedConcept).isNotNull();
            assertThat(codedConcept.getConceptAnswers().size()).isEqualTo(3);

            json = mapper.readValue(this.getClass().getResource("/ref/concepts/addAnswers.json"), Object.class);
            template.postForEntity("/concepts", json, Void.class);

            Concept withAnswer4 = conceptRepository.findByName("Coded Question");
            assertThat(withAnswer4).isNotNull();
            assertThat(withAnswer4.getConceptAnswers().size()).isEqualTo(4);

            json = mapper.readValue(this.getClass().getResource("/ref/concepts/removeAnswers.json"), Object.class);
            template.postForEntity("/concepts", json, Void.class);

            Concept withoutAnswer3 = conceptRepository.findByName("Coded Question");
            assertThat(withoutAnswer3).isNotNull();
            assertThat(withoutAnswer3.getConceptAnswers().size()).isEqualTo(4);
            ConceptAnswer removedConceptAnswer = withoutAnswer3.getConceptAnswers().stream().filter(conceptAnswer -> conceptAnswer.getAnswerConcept().getName().equals("Coded Answer 3")).findFirst().get();
            assertThat(removedConceptAnswer).isNotNull();
            assertThat((removedConceptAnswer).isVoided()).isTrue();
        } catch (IOException e) {
            Assert.fail();
        }
    }

}