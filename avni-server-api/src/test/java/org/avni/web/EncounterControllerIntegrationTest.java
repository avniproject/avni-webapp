package org.avni.web;

import org.junit.Assert;
import org.junit.Test;
import org.avni.server.dao.EncounterRepository;
import org.avni.server.domain.Encounter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;

@Sql(value = {"/test-data.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(value = {"/tear-down.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
public class EncounterControllerIntegrationTest extends AbstractControllerIntegrationTest {

    @Autowired
    private EncounterRepository encounterRepository;

    private String ENCOUNTER_UUID = "fbfd4ce8-b03b-45b9-b919-1ef8a0d9651e";

    @Override
    public void setUp() throws Exception {
        super.setUp();
        setUser("demo-user");
    }

    @Test
    public void createNewEncounter() {
        try {
            Object json = mapper.readValue(this.getClass().getResource("/ref/encounters/newEncounter.json"), Object.class);
            post("/encounters", json);

            Encounter newEncounter = encounterRepository.findByUuid(ENCOUNTER_UUID);
            assertThat(newEncounter).isNotNull();

        } catch (IOException e) {
            Assert.fail();
        }
    }

    @Test
    public void voidExistingEncounter() {
        try {
            Object json = mapper.readValue(this.getClass().getResource("/ref/encounters/newEncounter.json"), Object.class);
            post("/encounters", json);

            Encounter newEncounter = encounterRepository.findByUuid(ENCOUNTER_UUID);
            assertThat(newEncounter).isNotNull();
            assertThat(newEncounter.isVoided()).isFalse();

            json = mapper.readValue(this.getClass().getResource("/ref/encounters/voidedEncounter.json"), Object.class);
            post("/encounters", json);

            Encounter voidedEncounter = encounterRepository.findByUuid(ENCOUNTER_UUID);
            assertThat(voidedEncounter).isNotNull();
            assertThat(voidedEncounter.isVoided()).isTrue();

        } catch (IOException e) {
            Assert.fail();
        }
    }

    @Test
    public void unvoidVoidedEncounter() {
        try {
            Object json = mapper.readValue(this.getClass().getResource("/ref/encounters/voidedEncounter.json"), Object.class);
            post("/encounters", json);

            Encounter voidedEncounter = encounterRepository.findByUuid(ENCOUNTER_UUID);
            assertThat(voidedEncounter).isNotNull();
            assertThat(voidedEncounter.isVoided()).isTrue();

            json = mapper.readValue(this.getClass().getResource("/ref/encounters/newEncounter.json"), Object.class);
            post("/encounters", json);

            Encounter newEncounter = encounterRepository.findByUuid(ENCOUNTER_UUID);
            assertThat(newEncounter).isNotNull();
            assertThat(newEncounter.isVoided()).isFalse();

        } catch (IOException e) {
            Assert.fail();
        }
    }

    @Test
    public void failWhenSingleSelectObservationHasNonExistentConceptAnswer() {
        try {
            Object json = mapper.readValue(this.getClass().getResource("/ref/encounters/invalidSingleSelectAnswer.json"), Object.class);
            String responseBody = postForBody("/encounters", json);

            assertThat(responseBody).isEqualTo("Concept answer '6f83d3e4-0e25-4f51-8b5e-5421322f3ffe' not found in Concept '9daa0b8a-985a-464d-a5ab-8a4f90e8a26b'");

        } catch (IOException e) {
            Assert.fail();
        }
    }

    @Test
    public void failWhenMultiSelectObservationHasNonExistentConceptAnswer() {
        try {
            Object json = mapper.readValue(this.getClass().getResource("/ref/encounters/invalidMultiSelectAnswers.json"), Object.class);
            String responseBody = postForBody("/encounters", json);

            assertThat(responseBody).isEqualTo("Concept answer '6f83d3e4-0e25-4f51-8b5e-5421322f3ffe' not found in Concept '9daa0b8a-985a-464d-a5ab-8a4f90e8a26b'");

        } catch (IOException e) {
            Assert.fail();
        }
    }

    @Test
    public void doesNotFailWhenObservationHasVoidedConceptAnswer() {
        try {
            Object json = mapper.readValue(this.getClass().getResource("/ref/encounters/voidedConceptAnswer.json"), Object.class);
            String responseBody = postForBody("/encounters", json);

            assertThat(responseBody).isEqualTo("null");
        } catch (IOException e) {
            Assert.fail();
        }
    }

    @Test
    public void createScheduledVisit() {
        try {
            Object json = mapper.readValue(this.getClass().getResource("/ref/encounters/scheduled.json"), Object.class);
            String x = postForBody("/encounters", json);

            Encounter encounter = encounterRepository.findByUuid("c92d53cc-2a83-4e9f-93a2-0f3d46d99c34");

            assertThat(encounter.getEarliestVisitDateTime().toString()).startsWith("3019-01-01");
            assertThat(encounter.getMaxVisitDateTime().toString()).startsWith("4019-01-01");

        } catch (IOException e) {
            e.printStackTrace();
            Assert.fail();
        }
    }
}
