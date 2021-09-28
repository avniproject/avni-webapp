package org.avni.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.avni.dao.ConceptRepository;
import org.avni.dao.OrganisationConfigRepository;
import org.avni.domain.Concept;
import org.avni.domain.ConceptDataType;
import org.avni.domain.Organisation;
import org.avni.domain.OrganisationConfig;
import org.avni.framework.security.UserContextHolder;
import org.avni.projection.CodedConceptProjection;
import org.avni.projection.ConceptProjection;
import org.avni.service.ConceptService;
import org.avni.util.ObjectMapperSingleton;
import org.avni.util.ReactAdminUtil;
import org.avni.web.request.ConceptContract;
import org.avni.web.request.application.ConceptUsageContract;
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
    @PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
    @ResponseBody
    public ConceptProjection getOneForWeb(@PathVariable String uuid) {
        return projectionFactory.createProjection(ConceptProjection.class, conceptService.get(uuid));
    }

    @GetMapping(value = "/web/concept")
    @PreAuthorize(value = "hasAnyAuthority('user', 'admin')")
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
    public ResponseEntity<ConceptUsageContract> getConceptUsage(@PathVariable String uuid) {
        ConceptUsageContract conceptUsageContract = new ConceptUsageContract();
        Concept concept = conceptRepository.findByUuid(uuid);
        if (concept == null)
            return ResponseEntity.notFound().build();
        if (ConceptDataType.NA.toString().equals(concept.getDataType())) {
            conceptService.addDependentConcepts(conceptUsageContract, concept);
        } else {
            conceptService.addDependentFormDetails(conceptUsageContract, concept);
        }
        return ResponseEntity.ok(conceptUsageContract);
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
