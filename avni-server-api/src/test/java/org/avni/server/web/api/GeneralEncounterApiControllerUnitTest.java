package org.avni.server.web.api;

import org.avni.messaging.domain.EntityType;
import org.avni.messaging.service.MessagingService;
import org.avni.server.dao.ConceptRepository;
import org.avni.server.dao.EncounterRepository;
import org.avni.server.dao.EncounterTypeRepository;
import org.avni.server.dao.IndividualRepository;
import org.avni.server.domain.Encounter;
import org.avni.server.domain.EncounterType;
import org.avni.server.domain.Individual;
import org.avni.server.domain.SubjectType;
import org.avni.server.service.EncounterService;
import org.avni.server.service.OrganisationConfigService;
import org.avni.server.web.request.api.ApiEncounterRequest;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;

import static org.mockito.Mockito.*;
import static org.mockito.MockitoAnnotations.initMocks;

public class GeneralEncounterApiControllerUnitTest {
    @Mock
    private EncounterRepository encounterRepository;
    @Mock
    private EncounterTypeRepository encounterTypeRepository;
    @Mock
    private IndividualRepository individualRepository;
    @Mock
    private ConceptRepository conceptRepository;
    @Mock
    private EncounterService encounterService;
    @Mock
    private OrganisationConfigService organisationConfigService;
    @Mock
    private MessagingService messagingService;
    
    private GeneralEncounterApiController generalEncounterApiController;

    @Before
    public void setUp() throws Exception {
        initMocks(this);
        generalEncounterApiController = new GeneralEncounterApiController(null, encounterRepository, conceptRepository,
                individualRepository,  encounterTypeRepository, encounterService, organisationConfigService, messagingService);
    }

    @Test
    public void shouldCallMessagingServiceIfMessagingEnabledOnSave() {
        ApiEncounterRequest apiEncounterRequest = mock(ApiEncounterRequest.class);
        Individual individual = mock(Individual.class);
        Encounter encounter = mock(Encounter.class);
        EncounterType encounterType = mock(EncounterType.class);
        SubjectType subjectType = mock(SubjectType.class);

        String externalId = "123";
        when(apiEncounterRequest.getExternalId()).thenReturn(externalId);
        when(encounterRepository.findByLegacyId(any())).thenReturn(encounter);
        when(encounterTypeRepository.findByName(any())).thenReturn(encounterType);
        String subjectId = "112";
        when(apiEncounterRequest.getSubjectId()).thenReturn(subjectId);
        when(individualRepository.findByLegacyIdOrUuid(subjectId)).thenReturn(individual);
        when(encounter.getIndividual()).thenReturn(individual);
        when(individual.getSubjectType()).thenReturn(subjectType);
        when(encounter.getEncounterType()).thenReturn(encounterType);

        Long encounterId = 12L;
        Long encounterTypeId = 34L;
        Long individualId = 56L;
        when(individual.getId()).thenReturn(individualId);
        when(encounter.getId()).thenReturn(encounterId);
        when(encounterType.getId()).thenReturn(encounterTypeId);

        when(organisationConfigService.isMessagingEnabled()).thenReturn(true).thenReturn(false);
        generalEncounterApiController.post(apiEncounterRequest);
        verify(messagingService).onEntityCreated(encounterId, encounterTypeId, EntityType.Encounter, individualId);
        verifyNoMoreInteractions(messagingService);

        generalEncounterApiController.post(apiEncounterRequest);
        verifyNoMoreInteractions(messagingService);
    }
}