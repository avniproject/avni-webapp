package org.avni.server.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.avni.server.dao.ConceptAnswerRepository;
import org.avni.server.dao.ConceptRepository;
import org.avni.server.domain.Concept;
import org.avni.server.domain.ConceptAnswer;
import org.avni.server.domain.ConceptDataType;
import org.avni.server.projection.CodedConceptProjection;
import org.avni.server.projection.ConceptProjection;
import org.avni.server.service.ConceptService;
import org.avni.server.util.ObjectMapperSingleton;
import org.avni.server.util.ReactAdminUtil;
import org.avni.server.util.S;
import org.avni.server.web.request.ConceptContract;
import org.avni.server.web.request.application.ConceptUsageContract;
import org.avni.server.web.request.syncAttribute.ConceptSyncAttributeContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.data.repository.query.Param;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.Collections;
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
    private ConceptAnswerRepository conceptAnswerRepository;

    @Autowired
    public ConceptController(ConceptRepository conceptRepository, ConceptService conceptService, ProjectionFactory projectionFactory, ConceptAnswerRepository conceptAnswerRepository) {
        this.conceptRepository = conceptRepository;
        this.conceptService = conceptService;
        this.projectionFactory = projectionFactory;
        this.conceptAnswerRepository = conceptAnswerRepository;
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

    @GetMapping(value = {"/concept/answerConcepts",  "/concept/answerConcepts/search/find"})
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    public Page<ConceptSyncAttributeContract> getAnswerConcept(@RequestParam(value = "conceptUUID", required = false) String conceptUUID, Pageable pageable) {
        if(S.isEmpty(conceptUUID)) {
            return new PageImpl<>(Collections.emptyList());
        }
        Concept concept = conceptRepository.findByUuid(conceptUUID);
        Page<ConceptAnswer> conceptAnswers = conceptAnswerRepository.findByConceptAndIsVoidedFalse(concept, pageable);
        return conceptAnswers.map(ca -> ConceptSyncAttributeContract.fromConcept(ca.getAnswerConcept()));
    }

    @GetMapping(value = "/concept/answerConcepts/search/findAllById")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @ResponseBody
    public Page<ConceptSyncAttributeContract> findByIds(@Param("ids") String[] ids, Pageable pageable) {
        return this.conceptRepository.findAllByUuidIn(ids, pageable).map(ConceptSyncAttributeContract::fromConcept);
    }

}
