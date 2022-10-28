package org.avni.server.service;

import org.avni.messaging.domain.EntityType;
import org.avni.messaging.service.MessagingService;
import org.avni.server.dao.ProgramEncounterRepository;
import org.avni.server.domain.EncounterType;
import org.avni.server.domain.Individual;
import org.avni.server.domain.ProgramEncounter;
import org.avni.server.domain.ProgramEnrolment;
import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;

import static org.mockito.Mockito.*;
import static org.mockito.MockitoAnnotations.initMocks;

public class ProgramEncounterServiceTest {

    public ProgramEncounterService programEncounterService;

    @Mock
    private ProgramEncounterRepository programEncounterRepository;

    @Mock
    private OrganisationConfigService organisationConfigService;

    @Mock
    private MessagingService messagingService;

    @Before
    public void setUp() throws Exception {
        initMocks(this);
        programEncounterService = new ProgramEncounterService(programEncounterRepository, null, null,
                null, null, null, null, organisationConfigService, messagingService);
    }

    @Test
    public void shouldCallMessagingServiceIfMessagingEnabledOnSave() {
        ProgramEncounter programEncounter = mock(ProgramEncounter.class);
        ProgramEnrolment programEnrolment = mock(ProgramEnrolment.class);
        EncounterType encounterType = mock(EncounterType.class);
        Individual individual = mock(Individual.class);

        when(programEncounter.getProgramEnrolment()).thenReturn(programEnrolment);
        when(programEnrolment.getIndividual()).thenReturn(individual);
        when(programEncounterRepository.save(programEncounter)).thenReturn(programEncounter);

        Long programEncounterId = 123L;
        Long encounterTypeId = 456L;
        Long individualId = 89L;
        when(programEncounter.getId()).thenReturn(programEncounterId);
        when(programEncounter.getEncounterType()).thenReturn(encounterType);
        when(encounterType.getId()).thenReturn(encounterTypeId);
        when(programEncounter.getIndividual()).thenReturn(individual);
        when(individual.getId()).thenReturn(individualId);

        when(organisationConfigService.isMessagingEnabled()).thenReturn(true).thenReturn(false);
        programEncounterService.save(programEncounter);
        verify(messagingService).onEntityCreateOrUpdate(programEncounterId, encounterTypeId, EntityType.ProgramEncounter, individualId);
        verifyNoMoreInteractions(messagingService);

        programEncounterService.save(programEncounter);
        verifyNoMoreInteractions(messagingService);
    }
}