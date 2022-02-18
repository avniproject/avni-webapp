package org.avni.importer.batch.csv.creator;

import org.avni.dao.OperationalSubjectTypeRepository;
import org.avni.domain.OperationalSubjectType;
import org.avni.domain.SubjectType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SubjectTypeCreator {

    private OperationalSubjectTypeRepository operationalSubjectTypeRepository;

    @Autowired
    public SubjectTypeCreator(OperationalSubjectTypeRepository operationalSubjectTypeRepository) {
        this.operationalSubjectTypeRepository = operationalSubjectTypeRepository;
    }

    public SubjectType getSubjectType(String subjectTypeValue, String header) throws Exception {
        OperationalSubjectType operationalSubjectType = operationalSubjectTypeRepository.findByNameIgnoreCase(subjectTypeValue);
        if (operationalSubjectType == null) {
            throw new Exception(String.format("'%s' '%s' not found", header, subjectTypeValue));
        }
        return operationalSubjectType.getSubjectType();
    }

}
