package org.openchs.web;

import org.openchs.dao.ConceptRepository;
import org.openchs.domain.Concept;
import org.openchs.web.request.ConceptContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
public class SearchController {
    private final ConceptRepository conceptRepository;
    private final Logger logger;

    @Autowired
    @Lazy
    public SearchController(ConceptRepository conceptRepository) {
        this.conceptRepository = conceptRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/search/concept", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin', 'user')")
    public List<ConceptContract> searchConcept(@RequestParam String name,
                                               @RequestParam(required = false) String dataType) {
        if (dataType == null) {
            return getConceptContract(conceptRepository.findByIsVoidedFalseAndActiveTrueAndNameIgnoreCaseContains(name));
        } else {
            return getConceptContract(conceptRepository.findByIsVoidedFalseAndActiveTrueAndDataTypeAndNameIgnoreCaseContains(dataType, name));
        }
    }

    private List<ConceptContract> getConceptContract(List<Concept> concepts) {
        return concepts
                .stream()
                .map(Concept::toConceptContract)
                .collect(Collectors.toList());
    }
}
