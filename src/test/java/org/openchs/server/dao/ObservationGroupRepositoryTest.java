package org.openchs.server.dao;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.openchs.server.domain.ObservationGroup;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@DataJpaTest
public class ObservationGroupRepositoryTest {
    @Autowired
    private ObservationGroupRepository observationGroupRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    public void checkJSONLoading() {
        ObservationGroup observationGroup = new ObservationGroup();
        String key = UUID.randomUUID().toString();
        observationGroup.addObservation(key, "Diabetes");
        entityManager.persist(observationGroup);

        ObservationGroup group = observationGroupRepository.findAll().iterator().next();
        Map<String, Object> observations = group.getObservations();
        assertThat(observations.size()).isGreaterThanOrEqualTo(1);
        assertThat(observations.get(key)).isEqualTo("Diabetes");
    }
}