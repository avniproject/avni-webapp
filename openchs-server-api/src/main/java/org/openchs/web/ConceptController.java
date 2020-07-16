package org.openchs.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.openchs.dao.ConceptRepository;
import org.openchs.domain.Concept;
import org.openchs.domain.ConceptDataType;
import org.openchs.projection.CodedConceptProjection;
import org.openchs.projection.ConceptProjection;
import org.openchs.service.ConceptService;
import org.openchs.util.ObjectMapperSingleton;
import org.openchs.util.ReactAdminUtil;
import org.openchs.web.request.ConceptContract;
import org.openchs.web.request.application.ConceptUsageContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;


@RestController
public class ConceptController implements RestControllerResourceProcessor<Concept> {
    private final Logger logger;
    private ConceptRepository conceptRepository;
    private ConceptService conceptService;
    private ProjectionFactory projectionFactory;
    ObjectMapper objectMapper;

    @Autowired
    public ConceptController(ConceptRepository conceptRepository, ConceptService conceptService, ProjectionFactory projectionFactory) {
        this.conceptRepository = conceptRepository;
        this.conceptService = conceptService;
        this.projectionFactory = projectionFactory;
        logger = LoggerFactory.getLogger(this.getClass());
        objectMapper = ObjectMapperSingleton.getObjectMapper();
    }

    @RequestMapping(value = "/concepts", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize("hasAnyAuthority('admin','organisation_admin')")
    void save(@RequestBody List<ConceptContract> conceptRequests) {
        conceptService.saveOrUpdateConcepts(conceptRequests);
    }

    @GetMapping(value = "/web/concept/{uuid}")
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin', 'admin')")
    @ResponseBody
    public ConceptProjection getOneForWeb(@PathVariable String uuid) {
        return projectionFactory.createProjection(ConceptProjection.class, conceptService.get(uuid));
    }

    @GetMapping(value = "/web/concept1")
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin', 'admin')")
    @ResponseBody
    public List<ConceptProjection> getconcept(@PathVariable String uuid) {

        List<String> uuid1 = new ArrayList<>();
        uuid1.add("483be0b2-b6ba-40e0-8bf7-91cb33c6e284");
        uuid1.add("fd630fa3-7122-40b5-9a4c-12bfe7a314e0");
       // conceptService.getConcept(uuid1).map(t -> projectionFactory.createProjection(ConceptProjection.class,t));
        List<ConceptProjection> projection = conceptService.getConcept(uuid1).stream().map(concept -> projectionFactory.createProjection(ConceptProjection.class, concept)) .collect(Collectors.toList());
       return projection;
    }

    @GetMapping(value = "/web/concept")
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin', 'admin')")
    @ResponseBody
    public ResponseEntity<ConceptProjection> getOneForWebByName(@RequestParam String name) {
        Concept concept = conceptRepository.findByName(name);
        if (concept == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(projectionFactory.createProjection(ConceptProjection.class, concept));
    }

    @GetMapping(value = "/web/concepts")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin')")
    @ResponseBody
    public PagedResources<Resource<Concept>> getAll(@RequestParam(value = "name", required = false) String name, Pageable pageable) {
        Sort sortWithId = pageable.getSort().and(new Sort("id"));
        PageRequest pageRequest = new PageRequest(pageable.getPageNumber(), pageable.getPageSize(), sortWithId);
        if (name == null) {
            return wrap(conceptRepository.getAllNonVoidedConcepts(pageRequest));
        } else {
            return wrap(conceptRepository.findByIsVoidedFalseAndNameIgnoreCaseContaining(name, pageRequest));
        }
    }

    @GetMapping(value = "/web/concept/usage/{uuid}")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin')")
    @ResponseBody
    public ConceptUsageContract getConceptUsage(@PathVariable String uuid) {
        ConceptUsageContract conceptUsageContract = new ConceptUsageContract();
        Concept concept = conceptRepository.findByUuid(uuid);
        if (ConceptDataType.NA.toString().equals(concept.getDataType())) {
            conceptService.addDependentConcepts(conceptUsageContract, concept);
        } else {
            conceptService.addDependentFormDetails(conceptUsageContract, concept);
        }
        return conceptUsageContract;
    }

    @GetMapping(value = "/codedConcepts")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin')")
    @ResponseBody
    public List<CodedConceptProjection> getAllCodedConcepts() {
        return conceptRepository.findAllByDataType("Coded")
                .stream()
                .map(t -> projectionFactory.createProjection(CodedConceptProjection.class, t))
                .collect(Collectors.toList());
    }

    @GetMapping(value = "/concept/dataTypes")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin', 'admin')")
    @ResponseBody
    public List<String> getDataTypes() {
        return Stream.of(ConceptDataType.values())
                .map(ConceptDataType::name)
                .collect(Collectors.toList());
    }

    @DeleteMapping(value = "/concept/{conceptUUID}")
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    public ResponseEntity deleteWeb(@PathVariable String conceptUUID) {
        try {
            Concept existingConcept = conceptRepository.findByUuid(conceptUUID);
            existingConcept.setVoided(!existingConcept.isVoided());
            existingConcept.setName(ReactAdminUtil.getVoidedName(existingConcept.getName(), existingConcept.getId()));
            conceptRepository.save(existingConcept);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
        return new ResponseEntity<>(HttpStatus.OK);
    }

}
