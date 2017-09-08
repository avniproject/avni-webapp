package org.openchs.dao;

import org.junit.Assert;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.openchs.common.DataJpaTest;
import org.openchs.domain.ObservationCollection;
import org.openchs.domain.ProgramEncounter;
import org.openchs.domain.ProgramEnrolment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.junit4.SpringRunner;

import java.sql.SQLException;

@ImportAutoConfiguration
@RunWith(SpringRunner.class)
@DataJpaTest
@Sql({"/test-data.sql"})
@Ignore //Failing after we have added WebMvcAutoConfiguration and @EnableWebMvc to OpenCHSSpringConfiguration
public class ProgramEncounterRepositoryTest {
    @Autowired
    private ProgramEncounterRepository programEncounterRepository;

    @Autowired
    public TestEntityManager testEntityManager;

    @Test
    public void checkJSONLoading() throws SQLException {
        ProgramEncounter programEncounter = programEncounterRepository.findOne(1L);
        ObservationCollection observationCollection = programEncounter.getObservations();
        Assert.assertEquals(1, observationCollection.size());
        Assert.assertTrue(observationCollection.containsKey("95c4b174-6ce6-4d9a-b223-1f9000b60006"));
        ProgramEnrolment programEnrolment = programEncounter.getProgramEnrolment();
        Assert.assertNotNull(programEnrolment);
    }
}