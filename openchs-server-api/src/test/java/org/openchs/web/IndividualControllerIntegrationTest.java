package org.openchs.web;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.openchs.common.AbstractControllerIntegrationTest;
import org.openchs.dao.IndividualRepository;
import org.openchs.domain.Individual;
import org.openchs.domain.JsonObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@Sql(value = {"/test-data.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
@Sql(value = {"/tear-down.sql"}, executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
public class IndividualControllerIntegrationTest extends AbstractControllerIntegrationTest {

    @Autowired
    private IndividualRepository individualRepository;

    private String INDIVIDUAL_UUID = "0a1bf764-4576-4d71-b8ec-25895a113e81";

    @Before
    public void setUp() throws Exception {
        super.setUp();
        setUser("demo-user");
    }

    @Test
    public void testGetAll() throws Exception {
        ResponseEntity<String> response = template.getForEntity(base.toString() + "/individual",
                String.class);
    }

    @Test
    public void createNewIndividual() {
        try {
            Object json = mapper.readValue(this.getClass().getResource("/ref/individual/newIndividual.json"), Object.class);
            post("/individuals", json);

            Individual newIndividual = individualRepository.findByUuid(INDIVIDUAL_UUID);
            assertThat(newIndividual).isNotNull();

        } catch (IOException e) {
            Assert.fail();
        }
    }

    @Test
    public void voidExistingIndividual() {
        try {
            Object json = mapper.readValue(this.getClass().getResource("/ref/individual/newIndividual.json"), Object.class);
            post("/individuals", json);

            Individual newIndividual = individualRepository.findByUuid(INDIVIDUAL_UUID);
            assertThat(newIndividual).isNotNull();
            assertThat(newIndividual.isVoided()).isFalse();

            json = mapper.readValue(this.getClass().getResource("/ref/individual/voidedIndividual.json"), Object.class);
            post("/individuals", json);

            Individual voidedIndividual = individualRepository.findByUuid(INDIVIDUAL_UUID);
            assertThat(voidedIndividual).isNotNull();
            assertThat(voidedIndividual.isVoided()).isTrue();

        } catch (IOException e) {
            Assert.fail();
        }
    }

    @Test
    public void unvoidVoidedIndividual() {
        try {
            Object json = mapper.readValue(this.getClass().getResource("/ref/individual/voidedIndividual.json"), Object.class);
            post("/individuals", json);

            Individual voidedIndividual = individualRepository.findByUuid(INDIVIDUAL_UUID);
            assertThat(voidedIndividual).isNotNull();
            assertThat(voidedIndividual.isVoided()).isTrue();

            json = mapper.readValue(this.getClass().getResource("/ref/individual/newIndividual.json"), Object.class);
            post("/individuals", json);

            Individual newIndividual = individualRepository.findByUuid(INDIVIDUAL_UUID);
            assertThat(newIndividual).isNotNull();
            assertThat(newIndividual.isVoided()).isFalse();

        } catch (IOException e) {
            Assert.fail();
        }
    }

    @Test
    public void shouldSearchWithinOperatingIndividualScope() {
        setUser("demo-user");
        String url = "/individual/search?size=10&page=0";
        ResponseEntity<JsonObject> catchment2 = template.getForEntity(base.toString() + url, JsonObject.class);
        Assert.assertEquals(1, ((List) catchment2.getBody().get("content")).size());

        setUser("demo-user-2");
        ResponseEntity<JsonObject> catchment1 = template.getForEntity(base.toString() + url, JsonObject.class);
        Assert.assertEquals(4, ((List) catchment1.getBody().get("content")).size());
    }

}