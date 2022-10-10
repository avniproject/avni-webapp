package org.avni.web;

import com.bugsnag.Bugsnag;
import org.avni.application.FormType;
import org.avni.dao.EncounterRepository;
import org.avni.dao.EncounterTypeRepository;
import org.avni.dao.IndividualRepository;
import org.avni.dao.ProgramEncounterRepository;
import org.avni.domain.Encounter;
import org.avni.domain.EncounterType;
import org.avni.domain.ProgramEncounter;
import org.avni.service.*;
import org.joda.time.DateTime;
import org.junit.Before;
import org.junit.Test;
import org.springframework.data.domain.PageRequest;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.mockito.Mockito.*;
import static org.mockito.MockitoAnnotations.initMocks;

public class EncounterControllerTest {

    private EncounterTypeRepository encounterTypeRepository = mock(EncounterTypeRepository.class);
    private EncounterRepository encounterRepository = mock(EncounterRepository.class);
    private UserService userService = mock(UserService.class);
    private EncounterService encounterService = mock(EncounterService.class);
    private ScopeBasedSyncService<Encounter> scopeBasedSyncService = mock(ScopeBasedSyncService.class);
    private FormMappingService formMappingService = mock(FormMappingService.class);
    private ObservationService observationService = mock(ObservationService.class);
    private IndividualRepository individualRepository = mock(IndividualRepository.class);
    private Bugsnag bugsnag = mock(Bugsnag.class);
    private EncounterController programEncounterController;

    @Before
    public void setUp() {
        initMocks(this);
        programEncounterController = new EncounterController(individualRepository, encounterTypeRepository, encounterRepository, observationService, userService, bugsnag, encounterService, scopeBasedSyncService, formMappingService);
    }

    /**
     * This is a valid scenario that happens when an existing form mapping is voided. The request should not fail in such scenarios
     */
    @Test
    public void shouldReturnEmptyListIfNoFormMappingsFound() {
        String encounterTypeUuid = "encounter-type-uuid";
        EncounterType encounterType = new EncounterType();
        when(encounterTypeRepository.findByUuid(encounterTypeUuid)).thenReturn(encounterType);
        when(formMappingService.find(encounterType, FormType.Encounter)).thenReturn(null);

        PagedResources<Resource<Encounter>> result = programEncounterController.getEncountersByOperatingIndividualScope(new DateTime(), new DateTime(), encounterTypeUuid, PageRequest.of(0, 10));

        assertThat(result.getContent().size(), equalTo(0));
        verifyZeroInteractions(scopeBasedSyncService);
        verify(encounterTypeRepository).findByUuid(encounterTypeUuid);
        verify(formMappingService).find(encounterType, FormType.Encounter);
    }
}