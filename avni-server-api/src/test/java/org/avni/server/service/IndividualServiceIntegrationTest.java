package org.avni.server.service;

import org.avni.server.common.AbstractControllerIntegrationTest;
import org.avni.server.domain.Individual;
import org.junit.Before;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.jdbc.Sql;

import static org.assertj.core.api.Assertions.assertThat;

@Sql(scripts = {"/test-data.sql"})
public class IndividualServiceIntegrationTest  extends AbstractControllerIntegrationTest {

    @Autowired
    private IndividualService individualService;

    @Before
    public void setUp() throws Exception {
        super.setUp();
        setUser("demo-user");
    }

    @Test
    public void shouldFindPhoneNumberIfAvailable() {
        Individual individual = individualService.findByUuid("4378dce3-247e-4393-8dd5-032c6eb0a655");
        String phoneNumber = individualService.findPhoneNumber(individual);
        assertThat(phoneNumber).isEqualTo("9282738493");
    }

    @Test
    public void shouldReturnNullIfPhoneNumberNotAvailable() {
        Individual individual = individualService.findByUuid("5378dce3-247e-4393-8dd5-032c6eb0a655");
        String phoneNumber = individualService.findPhoneNumber(individual);
        assertThat(phoneNumber).isNull();
    }

    @Test (expected = AssertionError.class)
    public void shouldNotAcceptNullIndividuals() {
        String phoneNumber = individualService.findPhoneNumber(null);
    }
}
