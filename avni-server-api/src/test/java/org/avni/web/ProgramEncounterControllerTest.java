package org.avni.web;

import org.avni.application.FormType;
import org.avni.dao.EncounterTypeRepository;
import org.avni.dao.ProgramEncounterRepository;
import org.avni.domain.EncounterType;
import org.avni.domain.ProgramEncounter;
import org.avni.service.FormMappingService;
import org.avni.service.ProgramEncounterService;
import org.avni.service.ScopeBasedSyncService;
import org.avni.service.UserService;
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

public class ProgramEncounterControllerTest {

    private EncounterTypeRepository encounterTypeRepository = mock(EncounterTypeRepository.class);
    private ProgramEncounterRepository programEncounterRepository = mock(ProgramEncounterRepository.class);
    private UserService userService = mock(UserService.class);
    private ProgramEncounterService programEncounterService = mock(ProgramEncounterService.class);
    private ScopeBasedSyncService<ProgramEncounter> scopeBasedSyncService = mock(ScopeBasedSyncService.class);
    private FormMappingService formMappingService = mock(FormMappingService.class);
    private ProgramEncounterController programEncounterController;

    @Before
    public void setUp() {
        initMocks(this);
        programEncounterController = new ProgramEncounterController(encounterTypeRepository, programEncounterRepository, userService, programEncounterService, scopeBasedSyncService, formMappingService);
    }

    /**
     * This is a valid scenario that happens when an existing form mapping is voided. The request should not fail in such scenarios
     */
    @Test
    public void shouldReturnEmptyListIfNoFormMappingsFound() {
        String encounterTypeUuid = "encounter-type-uuid";
        EncounterType encounterType = new EncounterType();
        when(encounterTypeRepository.findByUuid(encounterTypeUuid)).thenReturn(encounterType);
        when(formMappingService.find(encounterType, FormType.ProgramEncounter)).thenReturn(null);

        PagedResources<Resource<ProgramEncounter>> result = programEncounterController.getProgramEncountersByOperatingIndividualScope(new DateTime(), new DateTime(), encounterTypeUuid, PageRequest.of(0, 10));

        assertThat(result.getContent().size(), equalTo(0));
        verifyZeroInteractions(scopeBasedSyncService);
        verify(encounterTypeRepository).findByUuid(encounterTypeUuid);
        verify(formMappingService).find(encounterType, FormType.ProgramEncounter);
    }
}