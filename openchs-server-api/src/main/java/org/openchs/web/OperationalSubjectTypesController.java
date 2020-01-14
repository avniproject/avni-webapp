package org.openchs.web;

import org.openchs.dao.OperationalSubjectTypeRepository;
import org.openchs.dao.OrganisationRepository;
import org.openchs.dao.SubjectTypeRepository;
import org.openchs.domain.OperationalSubjectType;
import org.openchs.domain.Organisation;
import org.openchs.domain.SubjectType;
import org.openchs.framework.security.UserContextHolder;
import org.openchs.web.request.OperationalSubjectTypeContract;
import org.openchs.web.request.OperationalSubjectTypesContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.transaction.Transactional;

@RestController
public class OperationalSubjectTypesController {
    private final Logger logger;
    private final OperationalSubjectTypeRepository operationalSubjectTypeRepository;
    private final SubjectTypeRepository subjectTypeRepository;
    private final OrganisationRepository organisationRepository;

    @Autowired
    public OperationalSubjectTypesController(OperationalSubjectTypeRepository operationalSubjectTypeRepository, SubjectTypeRepository subjectTypeRepository, OrganisationRepository organisationRepository) {
        this.operationalSubjectTypeRepository = operationalSubjectTypeRepository;
        this.subjectTypeRepository = subjectTypeRepository;
        this.organisationRepository = organisationRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    @RequestMapping(value = "/operationalSubjectTypes", method = RequestMethod.POST)
    @PreAuthorize(value = "hasAnyAuthority('organisation_admin')")
    @Transactional
    void saveOperationalSubjectTypes(@RequestBody OperationalSubjectTypesContract request) {
        Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
        request.getOperationalSubjectTypes().forEach(operationalSubjectTypeContract -> {
            createOperationalSubjectType(operationalSubjectTypeContract, organisation);
        });
    }

    private OperationalSubjectType createOperationalSubjectType(OperationalSubjectTypeContract operationalSubjectTypeContract, Organisation organisation) {
        String subjectTypeUUID = operationalSubjectTypeContract.getSubjectType().getUuid();
        SubjectType subjectType = subjectTypeRepository.findByUuid(subjectTypeUUID);
        if (subjectType == null) {
            logger.info(String.format("SubjectType not found for uuid: '%s'", subjectTypeUUID));
        }

        OperationalSubjectType operationalSubjectType = operationalSubjectTypeRepository.findByUuid(operationalSubjectTypeContract.getUuid());

        if (operationalSubjectType == null) {
            operationalSubjectType = new OperationalSubjectType();
        }

        operationalSubjectType.setUuid(operationalSubjectTypeContract.getUuid());
        operationalSubjectType.setName(operationalSubjectTypeContract.getName());
        operationalSubjectType.setSubjectType(subjectType);
        operationalSubjectType.setOrganisationId(organisation.getId());
        operationalSubjectType.setVoided(operationalSubjectTypeContract.isVoided());
        operationalSubjectTypeRepository.save(operationalSubjectType);
        return operationalSubjectType;
    }
}
