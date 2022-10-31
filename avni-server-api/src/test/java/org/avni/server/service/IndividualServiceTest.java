package org.avni.server.service;

import org.avni.server.dao.ConceptRepository;
import org.avni.server.dao.IndividualRepository;
import org.avni.server.domain.Individual;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;
import static org.mockito.MockitoAnnotations.initMocks;

public class IndividualServiceTest {

    @Mock
    private IndividualRepository individualRepository;

    private IndividualService individualService;

    @Before
    public void setUp() throws Exception {
        initMocks(this);
        individualService = new IndividualService(individualRepository,
                null, null, null, null, null, null);
    }


    @Test
    public void shouldFindById() {
        Individual individual = mock(Individual.class);
        Long individualId = 123L;
        when(individualRepository.findEntity(individualId)).thenReturn(individual);

        Individual actualIndividual = individualService.findById(individualId);

        verify(individualRepository).findEntity(individualId);
        assertThat(actualIndividual).isEqualToComparingFieldByFieldRecursively(individual);
    }
}
