package org.avni.server.web;

import org.avni.messaging.domain.EntityType;
import org.avni.messaging.service.MessagingService;
import org.avni.server.dao.EncounterRepository;
import org.avni.server.dao.EncounterTypeRepository;
import org.avni.server.dao.IndividualRepository;
import org.avni.server.domain.Encounter;
import org.avni.server.domain.EncounterType;
import org.avni.server.domain.Individual;
import org.avni.server.service.EncounterService;
import org.avni.server.service.ObservationService;
import org.avni.server.service.OrganisationConfigService;
import org.avni.server.web.request.EncounterRequest;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;

import static org.mockito.Mockito.*;
import static org.mockito.MockitoAnnotations.initMocks;

public class EncounterControllerUnitTest {

    @Mock
    private OrganisationConfigService organisationConfigService;
    @Mock
    private ObservationService observationService;
    @Mock
    private MessagingService messagingService;
    @Mock
    private EncounterService encounterService;
    @Mock
    private EncounterTypeRepository encounterTypeRepository;
    @Mock
    private EncounterRepository encounterRepository;
    @Mock
    private IndividualRepository individualRepository;
    private EncounterController encounterController;

    @Before
    public void setUp() throws Exception {
        initMocks(this);
        encounterController = new EncounterController(individualRepository, encounterTypeRepository,
                encounterRepository, observationService, null, null, encounterService,
                null, null, messagingService, organisationConfigService);
    }

    @Test
    public void shouldCallMessagingServiceIfMessagingEnabledOnSave() {
        EncounterRequest encounterRequest = mock(EncounterRequest.class);
        Encounter encounter = mock(Encounter.class);
        EncounterType encounterType = mock(EncounterType.class);
        Individual individual = mock(Individual.class);

        when(individualRepository.findByUuid(any())).thenReturn(individual);
        String encounterRequestUuid = "uuid";
        when(encounterRequest.getUuid()).thenReturn(encounterRequestUuid);
        when(encounterTypeRepository.findByUuidOrName(any(), any())).thenReturn(encounterType);
        when(encounterRepository.findByUuid(encounterRequestUuid)).thenReturn(encounter);

        Long encounterId = 123L;
        Long encounterTypeId = 456L;
        Long individualId = 789L;
        when(encounter.getId()).thenReturn(encounterId);
        when(encounterType.getId()).thenReturn(encounterTypeId);
        when(individual.getId()).thenReturn(individualId);

        when(organisationConfigService.isMessagingEnabled()).thenReturn(true).thenReturn(false);
        encounterController.save(encounterRequest);
        verify(messagingService).onEntityCreateOrUpdate(encounterId, encounterTypeId, EntityType.Encounter, individualId);
        verifyNoMoreInteractions(messagingService);

        encounterController.save(encounterRequest);
        verifyNoMoreInteractions(messagingService);
    }
}