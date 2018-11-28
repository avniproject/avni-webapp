package org.openchs.web;

import org.openchs.dao.EncounterTypeRepository;
import org.openchs.domain.EncounterType;
import org.openchs.service.ConceptService;
import org.openchs.web.request.EncounterTypeContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;
import java.util.List;

@RestController
public class EncounterTypeController extends AbstractController<EncounterType> {
    private final Logger logger;
    private EncounterTypeRepository encounterTypeRepository;

    @Autowired
    public EncounterTypeController(EncounterTypeRepository encounterTypeRepository, ConceptService conceptService) {
        this.encounterTypeRepository = encounterTypeRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/encounterTypes", method = RequestMethod.POST)
    @Transactional
    @PreAuthorize(value = "hasAnyAuthority('admin','organisation_admin')")
    void save(@RequestBody List<EncounterTypeContract> encounterTypeRequests) {
        for (EncounterTypeContract encounterTypeRequest : encounterTypeRequests) {
            EncounterType encounterType = newOrExistingEntity(encounterTypeRepository, encounterTypeRequest, new EncounterType());
            encounterType.setName(encounterTypeRequest.getName());
            encounterType.setVoided(encounterTypeRequest.isVoided());
            encounterTypeRepository.save(encounterType);
        }
    }
}