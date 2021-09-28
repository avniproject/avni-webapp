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

    public SubjectType getSubjectType(String subjectTypeValue, List<String> errorMsgs, String key) {
        OperationalSubjectType operationalSubjectType = operationalSubjectTypeRepository.findByNameIgnoreCase(subjectTypeValue);
        if (operationalSubjectType == null) {
            errorMsgs.add(String.format("'%s' not found", key));
            return null;
        }
        return operationalSubjectType.getSubjectType();
    }

}
