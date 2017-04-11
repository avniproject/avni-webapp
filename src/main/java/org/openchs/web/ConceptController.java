package org.openchs.web;

import org.openchs.dao.ConceptRepository;
import org.openchs.domain.Concept;
import org.openchs.web.request.ConceptContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;
import java.util.List;

@RestController
public class ConceptController {
    private ConceptRepository conceptRepository;

    @Autowired
    public ConceptController(ConceptRepository conceptRepository) {
        this.conceptRepository = conceptRepository;
    }

    @RequestMapping(value = "/concepts", method = RequestMethod.POST)
    @Transactional
    void save(@RequestBody List<ConceptContract> conceptRequests) {
        conceptRequests.forEach(conceptRequest -> {
            Concept concept = conceptRepository.findByUuid(conceptRequest.getUuid());
            if (concept == null) {
                concept = new Concept();
                concept.setUuid(conceptRequest.getUuid());
            }
            concept.setName(conceptRequest.getName());
            concept.setDataType(conceptRequest.getDataType());
            conceptRepository.save(concept);
        });
    }
}