package org.openchs.service;

import org.openchs.dao.OperationalSubjectTypeRepository;
import org.openchs.dao.SubjectTypeRepository;
import org.openchs.domain.OperationalSubjectType;
import org.openchs.domain.Organisation;
import org.openchs.domain.SubjectType;
import org.openchs.web.request.OperationalSubjectTypeContract;
import org.openchs.web.request.SubjectTypeContract;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SubjectTypeService {

    private final Logger logger;
    private final OperationalSubjectTypeRepository operationalSubjectTypeRepository;
    private SubjectTypeRepository subjectTypeRepository;

    @Autowired
    public SubjectTypeService(SubjectTypeRepository subjectTypeRepository, OperationalSubjectTypeRepository operationalSubjectTypeRepository) {
        this.subjectTypeRepository = subjectTypeRepository;
        this.operationalSubjectTypeRepository = operationalSubjectTypeRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    public void saveSubjectType(SubjectTypeContract subjectTypeRequest) {
        logger.info(String.format("Creating subjectType: %s", subjectTypeRequest.toString()));
        SubjectType subjectType = subjectTypeRepository.findByUuid(subjectTypeRequest.getUuid());
        if (subjectType == null) {
            subjectType = createSubjectType(subjectTypeRequest);
        }
        subjectType.setName(subjectTypeRequest.getName());
        subjectTypeRepository.save(subjectType);
    }

    private SubjectType createSubjectType(SubjectTypeContract programRequest) {
        SubjectType subjectType = new SubjectType();
        subjectType.setUuid(programRequest.getUuid());
        subjectType.setVoided(programRequest.isVoided());
        subjectType.setGroup(programRequest.isGroup());
        return subjectType;
    }

    public void createOperationalSubjectType(OperationalSubjectTypeContract operationalSubjectTypeContract, Organisation organisation) {
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
    }

    public SubjectType createIndividualSubjectType() {
        SubjectType subjectType = new SubjectType();
        subjectType.assignUUID();
        subjectType.setName("Individual");
        SubjectType savedSubjectType = subjectTypeRepository.save(subjectType);
        saveIndividualOperationalSubjectType(savedSubjectType);
        return savedSubjectType;
    }

    private void saveIndividualOperationalSubjectType(SubjectType subjectType) {
        OperationalSubjectType operationalSubjectType = new OperationalSubjectType();
        operationalSubjectType.assignUUID();
        operationalSubjectType.setName(subjectType.getName());
        operationalSubjectType.setSubjectType(subjectType);
        operationalSubjectTypeRepository.save(operationalSubjectType);
    }
}
