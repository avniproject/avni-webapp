package org.openchs.web;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.openchs.dao.ConceptRepository;
import org.openchs.domain.Concept;
import org.openchs.domain.ConceptDataType;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.projection.ConceptProjection;
import org.openchs.service.ConceptService;
import org.openchs.util.ObjectMapperSingleton;
import org.openchs.web.request.ConceptContract;
import org.openchs.web.request.webapp.ConceptExport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.Pageable;
import org.springframework.data.projection.ProjectionFactory;
import org.springframework.hateoas.PagedResources;
import org.springframework.hateoas.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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
        conceptRequests.forEach(conceptService::saveOrUpdate);
    }

    @RequestMapping(value = "/concepts/export", method = RequestMethod.GET)
    @PreAuthorize("hasAnyAuthority('admin','organisation_admin')")
    public ResponseEntity<ByteArrayResource> export() throws JsonProcessingException {
        Long orgId = UserContextHolder.getUserContext().getOrganisation().getId();

        List<ConceptExport> conceptContracts = new ArrayList<>();
        List<Concept> naConcepts = conceptRepository.findAllByOrganisationIdAndDataType(orgId, "NA");
        List<Concept> codedConcepts = conceptRepository.findAllByOrganisationIdAndDataType(orgId, "Coded");
        List<Concept> otherThanCodedOrNA = conceptRepository.findAllByOrganisationIdAndDataTypeNotIn(orgId, new String[]{"NA", "Coded"});

        for (Concept concept : naConcepts) {
            conceptContracts.add(ConceptExport.fromConcept(concept));
        }
        for (Concept concept : codedConcepts) {
            conceptContracts.add(ConceptExport.fromConcept(concept));
        }
        for (Concept concept : otherThanCodedOrNA) {
            conceptContracts.add(ConceptExport.fromConcept(concept));
        }

        HttpHeaders header = new HttpHeaders();
        header.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=concepts.json");
        header.add("Cache-Control", "no-cache, no-store, must-revalidate");
        header.add("Pragma", "no-cache");
        header.add("Expires", "0");

        byte[] byteArray = objectMapper.writer().writeValueAsBytes(conceptContracts);
        ByteArrayResource resource = new ByteArrayResource(byteArray);

        return ResponseEntity.ok()
                .headers(header)
                .contentLength(byteArray.length)
                .contentType(MediaType.parseMediaType("application/octet-stream"))
                .body(resource);

    }

    @GetMapping(value = "/web/concept/{uuid}")
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    @ResponseBody
    public ConceptProjection getOneForWeb(@PathVariable String uuid) {
        return projectionFactory.createProjection(ConceptProjection.class, conceptService.get(uuid));
    }

    @GetMapping(value = "/web/concept/name/{name}")
    @PreAuthorize(value = "hasAnyAuthority('user', 'organisation_admin')")
    @ResponseBody
    public ResponseEntity<ConceptProjection> getOneForWebByName(@PathVariable String name) {
        Concept concept = conceptRepository.findByNameIgnoreCase(name);
        if (concept == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(projectionFactory.createProjection(ConceptProjection.class, concept));
    }

    @GetMapping(value = "/web/concepts")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @ResponseBody
    public PagedResources<Resource<Concept>> getAll(@RequestParam(value = "name", required = false) String name, Pageable pageable) {
        if (name == null) {
            return wrap(conceptRepository.findAll(pageable));
        } else {
            return wrap(conceptRepository.findByNameIgnoreCaseContaining(name, pageable));
        }
    }

    @GetMapping(value = "/concept/dataTypes")
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @ResponseBody
    public List<String> getDataTypes() {
        return Stream.of(ConceptDataType.values())
                .map(ConceptDataType::name)
                .collect(Collectors.toList());
    }

}
