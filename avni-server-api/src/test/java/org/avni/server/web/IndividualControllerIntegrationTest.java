package org.avni.server.web;

import org.avni.server.common.AbstractControllerIntegrationTest;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.avni.server.dao.IndividualRepository;
import org.avni.server.domain.Individual;
import org.avni.server.domain.JsonObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.jdbc.Sql;

import java.io.IOException;
import java.util.List;
import java.util.function.Function;

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
    public void shouldSearchRegardlessOfOperatingIndividualScope() throws IOException {
        String url = "/individual/search?size=10&page=0";
        Function<String, Integer> countOfIndividuals = (user) -> {
            setUser(user);
            ResponseEntity<JsonObject> individuals = template.getForEntity(base.toString() + url, JsonObject.class);
            return ((List) individuals.getBody().get("content")).size();
        };
        String catchmentYUser = "demo-user";
        String catchmentXUser = "demo-user-2";
        Object newIndividualInX = mapper.readValue(this.getClass().getResource("/ref/individual/newIndividual.json"), Object.class);

        Integer totalIndividualsInCatchmentXBeforeTest = countOfIndividuals.apply(catchmentXUser);
        Integer totalIndividualsInCatchmentYBeforeTest = countOfIndividuals.apply(catchmentYUser);

        post(catchmentXUser, "/individuals", newIndividualInX);

        Assert.assertEquals(1, countOfIndividuals.apply(catchmentXUser) - totalIndividualsInCatchmentXBeforeTest);

        Assert.assertEquals(1, countOfIndividuals.apply(catchmentYUser) - totalIndividualsInCatchmentYBeforeTest);
    }

}
