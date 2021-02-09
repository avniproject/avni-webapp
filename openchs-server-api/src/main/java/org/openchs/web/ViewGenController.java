package org.openchs.web;

import org.flywaydb.core.internal.util.ExceptionUtils;
import org.openchs.application.FormMapping;
import org.openchs.application.projections.ReportingViewProjection;
import org.openchs.dao.OrganisationRepository;
import org.openchs.dao.SubjectTypeRepository;
import org.openchs.dao.application.FormMappingRepository;
import org.openchs.domain.*;
import org.openchs.domain.metadata.SubjectTypes;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.reporting.ReportingViews;
import org.openchs.reporting.ViewGenService;
import org.openchs.service.MetaDataRepository;
import org.openchs.service.ViewNameGenerator;
import org.openchs.visitor.CreateReportingViewVisitor;
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
    private MetaDataRepository metaDataService;
    private CreateReportingViewVisitor createReportingViewVisitor;
    private final Logger logger;

    public ViewGenController(ViewGenService viewGenService, SubjectTypeRepository subjectTypeRepository,
                             OrganisationRepository organisationRepository, FormMappingRepository formMappingRepository, MetaDataRepository metaDataService, CreateReportingViewVisitor createReportingViewVisitor) {
        this.viewGenService = viewGenService;
        this.subjectTypeRepository = subjectTypeRepository;
        this.organisationRepository = organisationRepository;
        this.formMappingRepository = formMappingRepository;
        this.metaDataService = metaDataService;
        this.createReportingViewVisitor = createReportingViewVisitor;
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
        SubjectTypes subjectTypes = metaDataService.getSubjectTypes();
        subjectTypes.accept(createReportingViewVisitor);
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

    private List<ReportingViewResponse> getAllReportingViews(Organisation organisation) {
        List<ReportingViewProjection> allViewsOwnedByUser = organisationRepository.getAllViewsWithDdlOwnedBy(organisation.getDbUser());
        return allViewsOwnedByUser
                .stream()
                .map(rp -> new ReportingViewResponse(rp.getViewname(), ReportingViews.legacyViews.contains(rp.getViewname()), rp.getDefinition()))
                .collect(Collectors.toList());
    }
}
