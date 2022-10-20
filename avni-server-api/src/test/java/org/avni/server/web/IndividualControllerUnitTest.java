package org.avni.server.web;

import org.avni.messaging.domain.EntityType;
import org.avni.messaging.service.MessagingService;
import org.avni.server.dao.GenderRepository;
import org.avni.server.dao.IndividualRepository;
import org.avni.server.dao.LocationRepository;
import org.avni.server.dao.SubjectTypeRepository;
import org.avni.server.domain.Individual;
import org.avni.server.domain.SubjectType;
import org.avni.server.service.IndividualService;
import org.avni.server.service.ObservationService;
import org.avni.server.service.OrganisationConfigService;
import org.avni.server.service.SubjectMigrationService;
import org.avni.server.web.request.IndividualRequest;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;

import static org.mockito.Mockito.*;
import static org.mockito.MockitoAnnotations.initMocks;

public class IndividualControllerUnitTest {
    @Mock
    private MessagingService messagingService;
    @Mock
    private OrganisationConfigService organisationConfigService;
    @Mock
    private ObservationService observationService;
    @Mock
    private IndividualService individualService;
    @Mock
    private LocationRepository locationRepository;
    @Mock
    private GenderRepository genderRepository;
    @Mock
    private SubjectTypeRepository subjectTypeRepository;
    @Mock
    private IndividualRepository individualRepository;
    @Mock
    private SubjectMigrationService subjectMigrationService;
    private IndividualController individualController;

    @Before
    public void setUp() throws Exception {
        initMocks(this);
        individualController = new IndividualController(individualRepository, locationRepository, genderRepository, observationService,
                null, subjectTypeRepository, null, individualService, null, null,
                null, null, organisationConfigService, null,
                subjectMigrationService, messagingService);
    }

    @Test
    public void shouldCallMessagingServiceIfMessagingEnabled() {
        IndividualRequest individualRequest = mock(IndividualRequest.class);
        Individual individual = mock(Individual.class);
        SubjectType subjectType = mock(SubjectType.class);

        String individualRequestUuid = "uuid";
        when(individualRequest.getUuid()).thenReturn(individualRequestUuid);
        when(individualRepository.findByUuid(individualRequestUuid)).thenReturn(individual);
        when(subjectTypeRepository.findByUuid("9f2af1f9-e150-4f8e-aad3-40bb7eb05aa3")).thenReturn(subjectType);

        Long individualId = 123L;
        Long subjectId = 456L;
        when(individual.getSubjectType()).thenReturn(subjectType);
        when(subjectType.getId()).thenReturn(subjectId);
        when(individual.getId()).thenReturn(individualId);

        when(organisationConfigService.isMessagingEnabled()).thenReturn(true).thenReturn(false);
        individualController.save(individualRequest);
        verify(messagingService).onEntityCreated(individualId, subjectId, EntityType.Subject);
        verifyNoMoreInteractions(messagingService);

        individualController.save(individualRequest);
        verifyNoMoreInteractions(messagingService);
    }
}