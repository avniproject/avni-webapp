package org.openchs.web;

import org.flywaydb.core.internal.util.ExceptionUtils;
import org.openchs.application.FormMapping;
import org.openchs.application.projections.ReportingViewProjection;
import org.openchs.dao.OrganisationRepository;
import org.openchs.dao.SubjectTypeRepository;
import org.openchs.dao.application.FormMappingRepository;
import org.openchs.domain.*;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.reporting.ReportingViews;
import org.openchs.reporting.ViewGenService;
import org.openchs.service.ViewNameGenerator;
import org.openchs.web.request.ViewConfig;
import org.openchs.web.response.ReportingViewResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
public class ViewGenController {
    private final ViewGenService viewGenService;
    private final SubjectTypeRepository subjectTypeRepository;
    private final OrganisationRepository organisationRepository;
    private final FormMappingRepository formMappingRepository;
    private final Logger logger;

    public ViewGenController(ViewGenService viewGenService, SubjectTypeRepository subjectTypeRepository,
                             OrganisationRepository organisationRepository, FormMappingRepository formMappingRepository) {
        this.viewGenService = viewGenService;
        this.subjectTypeRepository = subjectTypeRepository;
        this.organisationRepository = organisationRepository;
        this.formMappingRepository = formMappingRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @PostMapping(value = "/query")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    public Map<String, String> query(@RequestBody ViewConfig viewConfig) {
        switch (viewConfig.getType()) {
            case Registration:
                return viewGenService.registrationViews(viewConfig.getSubjectType(), viewConfig.getSpreadMultiSelectObs());
            case ProgramEncounter:
                return viewGenService.getSqlsFor(viewConfig.getProgram(), viewConfig.getEncounterType(), viewConfig.getSpreadMultiSelectObs(), viewConfig.getSubjectType());
            case Encounter:
                return viewGenService.getSqlsFor(null, viewConfig.getEncounterType(), viewConfig.getSpreadMultiSelectObs(), viewConfig.getSubjectType());
            default:
                return new HashMap<>();
        }
    }

    @PostMapping(value = "/createReportingViews")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin')")
    @Transactional
    public List<ReportingViewResponse> createViews() {
        UserContext userContext = UserContextHolder.getUserContext();
        Organisation organisation = userContext.getOrganisation();
        ViewNameGenerator viewNameGenerator = new ViewNameGenerator(organisation);
        List<SubjectType> allSubjectTypes = subjectTypeRepository.findAllByIsVoidedFalse();
        allSubjectTypes.forEach(subjectType -> createRequiredViews(viewNameGenerator, subjectType));
        return getAllReportingViews(organisation);
    }

    @GetMapping(value = "/viewsInDb")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin')")
    public List<ReportingViewResponse> getAllViews() {
        UserContext userContext = UserContextHolder.getUserContext();
        Organisation organisation = userContext.getOrganisation();
        return getAllReportingViews(organisation);
    }

    @DeleteMapping(value = "/reportingView/{viewName}")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin')")
    public ResponseEntity deleteView(@PathVariable String viewName) {
        organisationRepository.dropView(viewName);
        return ResponseEntity.ok().build();
    }

    private void createRequiredViews(ViewNameGenerator viewNameGenerator, SubjectType subjectType) {
        Map<String, String> registrationViewMap = viewGenService.registrationViews(subjectType.getOperationalSubjectTypeName(), false);
        String registrationViewName = viewNameGenerator.getSubjectRegistrationViewName(subjectType);
        createView(registrationViewMap.get("Registration"), registrationViewName);
        List<FormMapping> allEnrolmentFormMappings = formMappingRepository.getAllEnrolmentFormMappings(subjectType.getUuid());
        List<FormMapping> allGeneralEncounterFormMappings = formMappingRepository.getAllGeneralEncounterFormMappings(subjectType.getUuid());
        allEnrolmentFormMappings.forEach(fm -> createProgramEnrolmentAndProgramEncounterViews(viewNameGenerator, subjectType, fm));
        allGeneralEncounterFormMappings.forEach(fm -> createGeneralEncounterViews(viewNameGenerator, subjectType, fm));
    }

    private void createGeneralEncounterViews(ViewNameGenerator viewNameGenerator, SubjectType subjectType, FormMapping generalEncounterFormMapping) {
        EncounterType encounterType = generalEncounterFormMapping.getEncounterType();
        Map<String, String> generalEncounterViewMap = viewGenService.getSqlsFor(null, encounterType.getOperationalEncounterTypeName(), false, subjectType.getOperationalSubjectTypeName());
        generalEncounterViewMap.forEach((et, etSql) -> {
            String generalEncounterViewName = viewNameGenerator.getGeneralEncounterViewName(subjectType, et);
            createView(etSql, generalEncounterViewName);
        });
    }

    private void createProgramEnrolmentAndProgramEncounterViews(ViewNameGenerator viewNameGenerator, SubjectType subjectType, FormMapping enrolmentMapping) {
        Program program = enrolmentMapping.getProgram();
        Map<String, String> programEnrolmentSqlMap = viewGenService.enrolmentViews(subjectType.getOperationalSubjectTypeName(), program.getOperationalProgramName());
        programEnrolmentSqlMap.forEach((prg, programSql) -> {
            String programEnrolmentViewName = viewNameGenerator.getProgramEnrolmentViewName(subjectType, prg);
            createView(programSql, programEnrolmentViewName);
        });
        createProgramEncounterViews(viewNameGenerator, subjectType, program);
    }

    private void createProgramEncounterViews(ViewNameGenerator viewNameGenerator, SubjectType subjectType, Program program) {
        Map<String, String> programEncounterViewMap = viewGenService.getSqlsFor(program.getOperationalProgramName(), null, false, subjectType.getOperationalSubjectTypeName());
        programEncounterViewMap.forEach((encounterType, programEncounterSql) -> {
            String programEncounterViewName = viewNameGenerator.getProgramEncounterViewName(subjectType, program, encounterType);
            createView(programEncounterSql, programEncounterViewName);
        });
    }

    private void createView(String viewSql, String viewName) {
        try {
            organisationRepository.createView(viewName, viewSql);
        } catch (Exception e) {
            logger.error("Error while creating view {}", viewName, e);
            logger.error(String.format("View SQL: %s", viewSql));
            throw new RuntimeException(String.format("Error while creating view %s, %s", viewName, ExceptionUtils.getRootCause(e).getMessage()));
        }
    }

    private List<ReportingViewResponse> getAllReportingViews(Organisation organisation) {
        List<ReportingViewProjection> allViewsOwnedByUser = organisationRepository.getAllViewsWithDdlOwnedBy(organisation.getDbUser());
        return allViewsOwnedByUser
                .stream()
                .map(rp -> new ReportingViewResponse(rp.getViewname(), ReportingViews.legacyViews.contains(rp.getViewname()), rp.getDefinition()))
                .collect(Collectors.toList());
    }
}
