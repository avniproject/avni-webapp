package org.openchs.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.openchs.dao.ConceptRepository;
import org.openchs.service.ConceptService;
import org.openchs.web.request.ConceptContract;
import org.openchs.web.request.ExportRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
public class ConceptController {
    private final Logger logger;
    private ConceptRepository conceptRepository;
    private ConceptService conceptService;

    @Autowired
    public ConceptController(ConceptRepository conceptRepository, ConceptService conceptService) {
        this.conceptRepository = conceptRepository;
        this.conceptService = conceptService;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/concepts", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize("hasAnyAuthority('admin','organisation_admin')")
    void save(@RequestBody List<ConceptContract> conceptRequests) {
        conceptRequests.forEach(conceptService::saveOrUpdate);
    }

    @RequestMapping(value = "/concepts/export", method = RequestMethod.POST)
    @PreAuthorize("hasAnyAuthority('admin','organisation_admin')")
    void export(@RequestBody ExportRequest exportRequest) {
        List<ConceptContract> conceptContracts = new ArrayList<>();
        conceptRepository.findAll().iterator().forEachRemaining(concept -> conceptContracts.add(concept.toConceptContract()));
        ObjectMapper mapper = null; //Use global instance of ObjectMapper

        try {
            mapper.writerWithDefaultPrettyPrinter().writeValue(new File(exportRequest.getFileName()), conceptContracts);
        } catch (IOException e) {
            e.printStackTrace();
        }
        logger.info("Concepts size: " + conceptContracts.size());
        logger.info(String.format("Exporting conceptContracts to : %s", exportRequest.getFileName()));
    }
}