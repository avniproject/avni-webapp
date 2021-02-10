package org.openchs.service;

import org.openchs.application.FormMapping;
import org.openchs.dao.SubjectTypeRepository;
import org.openchs.dao.application.FormMappingRepository;
import org.openchs.domain.Program;
import org.openchs.domain.SubjectType;
import org.openchs.domain.metadata.SubjectTypes;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MetaDataRepository {
    private SubjectTypeRepository subjectTypeRepository;
    private final FormMappingRepository formMappingRepository;

    public MetaDataRepository(SubjectTypeRepository subjectTypeRepository, FormMappingRepository formMappingRepository) {
        this.subjectTypeRepository = subjectTypeRepository;
        this.formMappingRepository = formMappingRepository;
    }

    public SubjectTypes getSubjectTypes() {
        List<SubjectType> subjectTypeList = subjectTypeRepository.findAllByIsVoidedFalse();
        SubjectTypes subjectTypes = new SubjectTypes(subjectTypeList);
        subjectTypeList.forEach(subjectType -> {
            List<FormMapping> allProgramEnrolmentFormMappings = formMappingRepository.getAllProgramEnrolmentFormMapping(subjectType);
            allProgramEnrolmentFormMappings.forEach(formMapping -> {
                Program program = formMapping.getProgram();
                subjectTypes.addProgram(subjectType, program);

                List<FormMapping> programEncounterFormMappings = formMappingRepository.getAllProgramEncounterFormMappings(subjectType, program);
                programEncounterFormMappings.forEach(peFM -> {
                    subjectTypes.addEncounterType(subjectType, peFM.getProgram(), peFM.getEncounterType());
                });
            });

            List<FormMapping> generalEncounterFormMappings = formMappingRepository.getAllGeneralEncounterFormMappings(subjectType);
            generalEncounterFormMappings.forEach(formMapping -> {
                subjectTypes.addEncounterType(subjectType, formMapping.getEncounterType());
            });
        });

        return subjectTypes;
    }
}