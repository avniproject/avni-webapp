package org.avni.server.web;

import org.avni.server.dao.ImplementationRepository;
import org.avni.server.dao.SubjectTypeRepository;
import org.avni.server.dao.application.FormMappingRepository;
import org.avni.server.domain.Organisation;
import org.avni.server.domain.metadata.SubjectTypes;
import org.avni.server.framework.security.UserContextHolder;
import org.avni.server.reporting.ViewGenService;
import org.avni.server.service.MetaDataRepository;
import org.avni.server.visitor.CreateReportingViewVisitor;
import org.avni.server.visitor.GetReportingViewSourceVisitor;
import org.avni.server.web.request.ViewConfig;
import org.avni.server.web.response.ReportingViewResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class ViewGenController {
    private final ViewGenService viewGenService;
    private final SubjectTypeRepository subjectTypeRepository;
    private final FormMappingRepository formMappingRepository;
    private MetaDataRepository metaDataService;
    private CreateReportingViewVisitor createReportingViewVisitor;
    private ImplementationRepository implementationRepository;
    private final Logger logger;

    public ViewGenController(ViewGenService viewGenService, SubjectTypeRepository subjectTypeRepository,
                             FormMappingRepository formMappingRepository, MetaDataRepository metaDataService, CreateReportingViewVisitor createReportingViewVisitor, ImplementationRepository implementationRepository) {
        this.viewGenService = viewGenService;
        this.subjectTypeRepository = subjectTypeRepository;
        this.formMappingRepository = formMappingRepository;
        this.metaDataService = metaDataService;
        this.createReportingViewVisitor = createReportingViewVisitor;
        this.implementationRepository = implementationRepository;
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
        Organisation organisation = UserContextHolder.getOrganisation();
        SubjectTypes subjectTypes = metaDataService.getSubjectTypes();
        subjectTypes.accept(createReportingViewVisitor);

        GetReportingViewSourceVisitor getReportingViewSourceVisitor = new GetReportingViewSourceVisitor(implementationRepository, organisation, formMappingRepository);
        subjectTypes.accept(getReportingViewSourceVisitor);
        return getReportingViewSourceVisitor.getReportingViewResponses();
    }

    @GetMapping(value = "/viewsInDb")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin')")
    public List<ReportingViewResponse> getAllViews() {
        Organisation organisation = UserContextHolder.getOrganisation();
        SubjectTypes subjectTypes = metaDataService.getSubjectTypes();
        GetReportingViewSourceVisitor getReportingViewSourceVisitor = new GetReportingViewSourceVisitor(implementationRepository, organisation, formMappingRepository);
        subjectTypes.accept(getReportingViewSourceVisitor);
        return getReportingViewSourceVisitor.getReportingViewResponses();
    }

    @DeleteMapping(value = "/reportingView/{viewName}")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin')")
    public ResponseEntity deleteView(@PathVariable String viewName) {
        Organisation organisation = UserContextHolder.getOrganisation();
        implementationRepository.dropView(viewName, organisation.getSchemaName());
        return ResponseEntity.ok().build();
    }
}
