package org.avni.service;

import org.avni.application.Subject;
import org.avni.dao.OperationalSubjectTypeRepository;
import org.avni.dao.SubjectTypeRepository;
import org.avni.domain.OperationalSubjectType;
import org.avni.domain.Organisation;
import org.avni.domain.SubjectType;
import org.avni.web.request.OperationalSubjectTypeContract;
import org.avni.web.request.SubjectTypeContract;
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
            subjectType = new SubjectType();
        }
        subjectType.setUuid(subjectTypeRequest.getUuid());
        subjectType.setVoided(subjectTypeRequest.isVoided());
        subjectType.setName(subjectTypeRequest.getName());
        subjectType.setGroup(subjectTypeRequest.isGroup());
        subjectType.setHousehold(subjectTypeRequest.isHousehold());
        subjectType.setActive(subjectTypeRequest.getActive());
        subjectType.setAllowEmptyLocation(subjectTypeRequest.isAllowEmptyLocation());
        subjectType.setUniqueName(subjectTypeRequest.isUniqueName());
        subjectType.setValidFirstNameFormat(subjectTypeRequest.getValidFirstNameFormat());
        subjectType.setValidLastNameFormat(subjectTypeRequest.getValidLastNameFormat());
        subjectType.setType(Subject.valueOf(subjectTypeRequest.getType()));
        subjectType.setSubjectSummaryRule(subjectTypeRequest.getSubjectSummaryRule());
        subjectType.setIconFileS3Key(subjectTypeRequest.getIconFileS3Key());
        subjectTypeRepository.save(subjectType);
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
