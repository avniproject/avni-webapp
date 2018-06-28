package org.openchs.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.openchs.dao.ConceptRepository;
import org.openchs.domain.Concept;
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
    private static final String FILE_NAME = "/Users/hithacker/projects/openchs/openchs-client/packages/openchs-health-modules/health_modules/exportedConcepts.json";

    @Autowired
    public ConceptController(ConceptRepository conceptRepository, ConceptService conceptService) {
        this.conceptRepository = conceptRepository;
        this.conceptService = conceptService;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/concepts", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin')")
    void save(@RequestBody List<ConceptContract> conceptRequests) {
        conceptRequests.forEach(conceptService::saveOrUpdate);
    }

    @RequestMapping(value = "/concepts/export", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('admin')")
    void export(@RequestBody ExportRequest exportRequest) {
        List<ConceptContract> conceptContracts = new ArrayList<>();
        conceptRepository.findAll().iterator().forEachRemaining(concept -> conceptContracts.add(concept.getConceptContract()));
//        conceptContracts.add(conceptRepository.findByUuid("4876f1ce-28f0-4788-8d22-d8a3db617fd2").getConceptContract());
        ObjectMapper mapper = new ObjectMapper();

        try {
            mapper.writerWithDefaultPrettyPrinter().writeValue(new File(FILE_NAME), conceptContracts);
        } catch (IOException e) {
            e.printStackTrace();
        }
        logger.info("Concepts size: " + conceptContracts.size());
        logger.info(String.format("Exporting conceptContracts to : %s", exportRequest.getFileName()));
    }
}