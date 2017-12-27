package org.openchs.service;

import org.apache.logging.log4j.util.Strings;
import org.openchs.application.Form;
import org.openchs.application.FormElement;
import org.openchs.application.FormMapping;
import org.openchs.application.FormType;
import org.openchs.dao.EncounterTypeRepository;
import org.openchs.dao.ProgramRepository;
import org.openchs.dao.application.FormMappingRepository;
import org.openchs.domain.EncounterType;
import org.openchs.domain.ObservationCollection;
import org.openchs.domain.Program;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FormService {
    private EncounterTypeRepository encounterTypeRepository;
    private FormMappingRepository formMappingRepository;
    private ProgramRepository programRepository;

    @Autowired
    public FormService(EncounterTypeRepository encounterTypeRepository, FormMappingRepository formMappingRepository, ProgramRepository programRepository) {
        this.encounterTypeRepository = encounterTypeRepository;
        this.formMappingRepository = formMappingRepository;
        this.programRepository = programRepository;
    }

    public Form findForm(FormType formType, String encounterTypeName, String programName) {
        Long programId = null;
        Long encounterTypeId = null;
        if (!Strings.isBlank(programName)) {
            Program program = programRepository.findByName(programName);
            programId = program.getId();
        }
        if (!Strings.isBlank(encounterTypeName)) {
            EncounterType encounterType = encounterTypeRepository.findByName(encounterTypeName);
            encounterTypeId = encounterType.getId();
        }
        FormMapping formMapping = formMappingRepository.findByEntityIdAndObservationsTypeEntityIdAndFormFormType(programId, encounterTypeId, formType);
        return formMapping.getForm();
    }

    public List<FormElement> getUnfilledMandatoryFormElements(Form form, ObservationCollection observationCollection) {
        List<FormElement> allFormElements = form.getAllFormElements();
        return allFormElements.stream().filter(formElement -> formElement.isMandatory() && !observationCollection.containsObservationFor(formElement.getConcept())).collect(Collectors.toList());
    }
}