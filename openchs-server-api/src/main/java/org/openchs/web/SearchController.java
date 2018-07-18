package org.openchs.web;

import org.openchs.service.HibernateSearchService;
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

@RestController
public class SearchController {
    private final HibernateSearchService searchService;
    private final Logger logger;

    @Autowired @Lazy
    public SearchController(HibernateSearchService searchService) {
        this.searchService = searchService;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/search/concept", method = RequestMethod.GET)
    @PreAuthorize(value = "hasAnyAuthority('admin', 'user', 'organisation_admin')")
    public List<ConceptContract> searchConcept(@RequestParam(value = "name") String query) {
        return searchService.searchConcepts(query);
    }
}
