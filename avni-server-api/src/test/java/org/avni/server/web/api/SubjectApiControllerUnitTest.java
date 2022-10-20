package org.avni.server.web.api;

import org.avni.messaging.domain.EntityType;
import org.avni.messaging.service.MessagingService;
import org.avni.server.dao.*;
import org.avni.server.domain.AddressLevel;
import org.avni.server.domain.Individual;
import org.avni.server.domain.SubjectType;
import org.avni.server.service.IndividualService;
import org.avni.server.service.OrganisationConfigService;
import org.avni.server.service.SubjectMigrationService;
import org.avni.server.web.request.api.ApiSubjectRequest;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.mockito.MockitoAnnotations.initMocks;

public class SubjectApiControllerUnitTest {
    @Mock
    private OrganisationConfigService organisationConfigService;
    @Mock
    private MessagingService messagingService;
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
    private ConceptRepository conceptRepository;
    @Mock
    private SubjectMigrationService subjectMigrationService;

    private SubjectApiController subjectApiController;

    @Before
    public void setUp() throws Exception {
        initMocks(this);
        subjectApiController = new SubjectApiController(null, individualRepository, conceptRepository,
                null, null, subjectTypeRepository, locationRepository, genderRepository,
                subjectMigrationService, individualService, null, organisationConfigService, messagingService);
    }

    @Test
    public void shouldCallMessagingServiceIfMessagingEnabledOnSave() {
        ApiSubjectRequest apiSubjectRequest = mock(ApiSubjectRequest.class);
        SubjectType subjectType = mock(SubjectType.class);
        AddressLevel addressLevel = mock(AddressLevel.class);
        Individual individual = mock(Individual.class);

        when(subjectTypeRepository.findByName(any())).thenReturn(subjectType);
        when(locationRepository.findByTitleLineageIgnoreCase(any())).thenReturn(Optional.ofNullable(addressLevel));

        Long subjectId = 123L;
        Long subjectTypeId = 456L;
        when(apiSubjectRequest.getExternalId()).thenReturn("externalId");
        when(individualRepository.findByLegacyId(any())).thenReturn(individual);
        when(individual.getId()).thenReturn(subjectId);
        when(individual.getSubjectType()).thenReturn(subjectType);
        when(subjectType.getId()).thenReturn(subjectTypeId);

        when(organisationConfigService.isMessagingEnabled()).thenReturn(true).thenReturn(false);
        subjectApiController.post(apiSubjectRequest);
        verify(messagingService).onEntityCreated(subjectId, subjectTypeId, EntityType.Subject, subjectId);
        verifyNoMoreInteractions(messagingService);

        subjectApiController.post(apiSubjectRequest);
        verifyNoMoreInteractions(messagingService);
    }
}