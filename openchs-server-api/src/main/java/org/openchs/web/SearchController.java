package org.openchs.web;

import org.openchs.service.HibernateSearchService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.openchs.domain.Concept;

@RestController
public class SearchController {
    private final HibernateSearchService searchService;
    private final Logger logger;

    @Autowired
    public SearchController(HibernateSearchService searchService) {
        this.searchService = searchService;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/search/concept", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin', 'user', 'organisation_admin')")
    public List<Concept> searchConcept(@RequestParam(value = "name") String query) {
        return searchService.searchConcepts(query);
    }

    @RequestMapping(value = "/search/conceptAnswers", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin', 'user', 'organisation_admin')")
    public List<Concept> searchConceptAnswers(@RequestParam(value = "name") String query) {
        return searchService.searchConceptAnswers(query);
    }
}
