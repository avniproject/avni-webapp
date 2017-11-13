package org.openchs.web;

import org.openchs.dao.ConceptRepository;
import org.openchs.domain.Concept;
import org.openchs.domain.ConceptDataType;
import org.openchs.web.request.ConceptContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;
import java.util.HashSet;
import java.util.List;

@RestController
public class ConceptController {
    private final Logger logger;
    private ConceptRepository conceptRepository;

    @Autowired
    public ConceptController(ConceptRepository conceptRepository) {
        this.conceptRepository = conceptRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/concepts", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin')")
    void save(@RequestBody List<ConceptContract> conceptRequests) {
        for (ConceptContract conceptRequest : conceptRequests) {
            logger.info(String.format("Creating concept: %s", conceptRequest.toString()));
            if (conceptExistsWithSameNameAndDifferentUUID(conceptRequest)) {
                throw new RuntimeException(String.format("Concept %s exists with different uuid", conceptRequest.getName()));
            }

            Concept concept = fetchOrCreateConcept(conceptRequest.getUuid());

            concept.setName(conceptRequest.getName());
            concept.setDataType(conceptRequest.getDataType());

            if (ConceptDataType.Numeric.toString().equals(conceptRequest.getDataType())) {
                new Helper().setNumericSpecificAttributes(conceptRequest, concept);
            }

            if (ConceptDataType.Coded.toString().equals(conceptRequest.getDataType())) {
                if (concept.getConceptAnswers() == null) concept.setConceptAnswers(new HashSet<>());
                new Helper().updateAnswers(concept, conceptRequest.getAnswers(), conceptRepository);
            }
            conceptRepository.save(concept);
        }
    }

    private Concept fetchOrCreateConcept(String uuid) {
        Concept concept = conceptRepository.findByUuid(uuid);
        if (concept == null) {
            concept = createConcept(uuid);
        }
        return concept;
    }

    private Concept createConcept(String uuid) {
        Concept concept = new Concept();
        concept.setUuid(uuid);
        return concept;
    }

    private boolean conceptExistsWithSameNameAndDifferentUUID(ConceptContract conceptRequest) {
        Concept concept = conceptRepository.findByName(conceptRequest.getName());
        return concept != null && !concept.getUuid().equals(conceptRequest.getUuid());
    }
}