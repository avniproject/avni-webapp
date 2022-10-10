package org.avni.web;

import org.avni.application.FormType;
import org.avni.dao.*;
import org.avni.domain.Encounter;
import org.avni.domain.EncounterType;
import org.avni.domain.Program;
import org.avni.domain.ProgramEnrolment;
import org.avni.service.*;
import org.joda.time.DateTime;
import org.junit.Before;
import org.junit.Test;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.mockito.Mockito.*;
import static org.mockito.MockitoAnnotations.initMocks;

public class ProgramEnolmentControllerTest {

    private final ProgramEnrolmentRepository programEnrolmentRepository = mock(ProgramEnrolmentRepository.class);
    private final UserService userService = mock(UserService.class);
    private final ProjectionFactory projectionFactory = mock(ProjectionFactory.class);
    private final ProgramEnrolmentService programEnrolmentService = mock(ProgramEnrolmentService.class);
    private final ProgramRepository programRepository = mock(ProgramRepository.class);
    private ScopeBasedSyncService<ProgramEnrolment> scopeBasedSyncService = mock(ScopeBasedSyncService.class);
    private FormMappingService formMappingService = mock(FormMappingService.class);
    private ProgramEnrolmentController programEnrolmentController;

    @Before
    public void setUp() {
        initMocks(this);
        programEnrolmentController = new ProgramEnrolmentController(programRepository, programEnrolmentRepository, userService, projectionFactory, programEnrolmentService, scopeBasedSyncService, formMappingService);
    }

    /**
     * This is a valid scenario that happens when an existing form mapping is voided. The request should not fail in such scenarios
     */
    @Test
    public void shouldReturnEmptyListIfNoFormMappingsFound() {
        String programUuid = "program-uuid";
        Program program = new Program();
        when(programRepository.findByUuid(programUuid)).thenReturn(program);
        when(formMappingService.find(program, FormType.ProgramEnrolment)).thenReturn(null);

        PagedResources<Resource<ProgramEnrolment>> result = programEnrolmentController.getProgramEnrolmentsByOperatingIndividualScope(new DateTime(), new DateTime(), programUuid, PageRequest.of(0, 10));

        assertThat(result.getContent().size(), equalTo(0));
        verifyZeroInteractions(scopeBasedSyncService);
        verify(programRepository).findByUuid(programUuid);
        verify(formMappingService).find(program, FormType.ProgramEnrolment);
    }
}