package org.openchs.dao;

import org.joda.time.LocalDate;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.openchs.common.DataJpaTest;
import org.openchs.domain.Gender;
import org.openchs.domain.Individual;
import org.openchs.domain.ObservationGroup;
import org.postgresql.util.PGobject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.junit4.SpringRunner;

import java.sql.SQLException;
import java.util.UUID;


@ImportAutoConfiguration
@RunWith(SpringRunner.class)
@DataJpaTest
public class ObservationGroupRepositoryTest {
    @Autowired
    private ObservationGroupRepository observationGroupRepository;

    @Autowired
    public TestEntityManager testEntityManager;


    @Test
    public void checkJSONLoading() throws SQLException {
        Gender gender = Gender.create("Other");
        testEntityManager.persist(gender);

        PGobject address = new PGobject();
        address.setType("KeyValuesJson");
        address.setValue("{'a':1}");
        Individual individual = Individual.create("Test patient", new LocalDate(System.currentTimeMillis()), false, gender, address);
        testEntityManager.persist(individual);

        String key = UUID.randomUUID().toString();
        ObservationGroup observationGroup = new ObservationGroup();
        observationGroup.setIndividual(individual);
        observationGroup.addObservation(key, "Diabetes");
        testEntityManager.persist(observationGroup);

        ObservationGroup group = observationGroupRepository.findAll().iterator().next();
//        Map<String, Object> observations = group.getObservations();
//        assertThat(observations.size()).isGreaterThanOrEqualTo(1);
//        assertThat(observations.get(key)).isEqualTo("Diabetes");
    }
}