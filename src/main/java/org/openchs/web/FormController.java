package org.openchs.web;

import org.openchs.application.*;
import org.openchs.dao.ConceptRepository;
import org.openchs.dao.EncounterTypeRepository;
import org.openchs.dao.ProgramRepository;
import org.openchs.dao.application.FormMappingRepository;
import org.openchs.dao.application.FormRepository;
import org.openchs.domain.*;
import org.openchs.web.request.CHSRequest;
import org.openchs.web.request.application.FormElementGroupContract;
import org.openchs.web.request.application.FormElementContract;
import org.openchs.web.request.application.FormContract;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
public class FormController {
    private FormRepository formRepository;
    private ProgramRepository programRepository;
    private EncounterTypeRepository encounterTypeRepository;
    private FormMappingRepository formMappingRepository;
    private ConceptRepository conceptRepository;

    @Autowired
    public FormController(FormRepository formRepository, ProgramRepository programRepository, EncounterTypeRepository encounterTypeRepository, FormMappingRepository formMappingRepository, ConceptRepository conceptRepository) {
        this.formRepository = formRepository;
        this.programRepository = programRepository;
        this.encounterTypeRepository = encounterTypeRepository;
        this.formMappingRepository = formMappingRepository;
        this.conceptRepository = conceptRepository;
    }

    //update scenario
    @RequestMapping(value = "/forms", method = RequestMethod.POST)
    @Transactional
    void save(@RequestBody FormContract formRequest) {
        Form form = formRepository.findByUuid(formRequest.getUuid());
        if (form == null) {
            form = Form.create();
            form.setName(formRequest.getName());
            form.setUuid(formRequest.getUuid());
        }
        form.setFormType(FormType.valueOf(formRequest.getFormType()));

        EncounterType encounterType = encounterTypeRepository.findByName(formRequest.getProgramName());
        if (encounterType == null) {
            encounterType = new EncounterType();
            encounterType.assignUUID();
            encounterType.setName(formRequest.getProgramName());
            encounterType = encounterTypeRepository.save(encounterType);
        }

        Program program = programRepository.findByName(formRequest.getProgramName());
        if (program == null) {
            program = new Program();
            program.assignUUID();
            program.setName(formRequest.getProgramName());
            program = programRepository.save(program);
        }

        for (int formElementGroupIndex = 0; formElementGroupIndex < formRequest.getFormElementGroups().size(); formElementGroupIndex++) {
            FormElementGroupContract formElementGroupRequest = formRequest.getFormElementGroups().get(formElementGroupIndex);
            FormElementGroup formElementGroup = form.findFormElementGroup(formElementGroupRequest.getUuid());
            if (formElementGroup == null) {
                formElementGroup = form.addFormElementGroup(formElementGroupRequest.getUuid());
            }
            formElementGroup.setName(formElementGroupRequest.getName());
            formElementGroup.setDisplayOrder((short) formElementGroupIndex);

            for (int formElementIndex = 0; formElementIndex < formElementGroupRequest.getFormElements().size(); formElementIndex++) {
                FormElementContract formElementRequest = formElementGroupRequest.getFormElements().get(formElementIndex);
                String conceptName = formElementRequest.getConceptName() == null ? formElementRequest.getName() : formElementRequest.getConceptName();
                Concept concept = conceptRepository.findByName(conceptName);
                if (concept == null) {
                    concept = Concept.create(conceptName, formElementRequest.getDataType());
                }
                if (ConceptDataType.Coded.toString().equals(formElementRequest.getDataType())) {
                    for (int answerIndex = 0; answerIndex < formElementRequest.getAnswers().size(); answerIndex++) {
                        String answerConceptName = formElementRequest.getAnswers().get(answerIndex);
                        ConceptAnswer conceptAnswer = concept.findConceptAnswer(answerConceptName);
                        if (conceptAnswer == null) {
                            conceptAnswer = new ConceptAnswer();
                            conceptAnswer.setOrder((short) (answerIndex + 1));
                            conceptAnswer.assignUUID();

                            Concept answer = conceptRepository.findByName(answerConceptName);
                            if (answer == null) {
                                answer = new Concept();
                                answer.setName(answerConceptName);
                                answer.assignUUID();
                                answer.setDataType(ConceptDataType.NA.toString());
                                conceptRepository.save(answer);
                            }
                            conceptAnswer.setAnswerConcept(answer);
                        }
                        concept.addAnswer(conceptAnswer);
                    }
                }
                conceptRepository.save(concept);

                FormElement formElement = formElementGroup.findFormElement(formElementRequest.getUuid());
                if (formElement == null) {
                    formElement = formElementGroup.addFormElement(formElementRequest.getUuid());
                }
                formElement.setName(formElementRequest.getName());
                formElement.setDisplayOrder((short) (formElementIndex + 1));
                formElement.setFormElementGroup(formElementGroup);
                formElement.setMandatory(formElementRequest.isMandatory());
                formElement.setKeyValues(formElementRequest.getKeyValues());
                formElement.setConcept(concept);

                List<String> formElementUUIDs = formElementGroupRequest.getFormElements().stream().map(CHSRequest::getUuid).collect(Collectors.toList());
                formElementGroup.removeFormElements(formElementUUIDs);
            }
        }

        List<String> formElementGroupUUIDs = formRequest.getFormElementGroups().stream().map(CHSRequest::getUuid).collect(Collectors.toList());
        form.removeFormElementGroups(formElementGroupUUIDs);

        FormMapping formMapping = formMappingRepository.findByFormUuid(form.getUuid());
        if (formMapping == null) {
            formMapping = new FormMapping();
            formMapping.assignUUID();
            formMapping.setForm(form);
        }
        formMapping.setEntityId(program.getId());
        formMapping.setObservationsTypeEntityId(encounterType.getId());

        formRepository.save(form);
        formMappingRepository.save(formMapping);
    }

    @RequestMapping(value = "/forms/export", method = RequestMethod.GET)
    public FormContract export(@RequestParam String formUUID) {
        Form form = formRepository.findByUuid(formUUID);
        FormMapping formMapping = formMappingRepository.findByFormUuid(form.getUuid());
        Long entityId = formMapping.getEntityId();
        FormContract formContract;
        if (entityId != null && entityId != 0) {
            formContract = new FormContract(formUUID, form.getLastModifiedBy().getUuid(), form.getName(), programRepository.findOne(entityId).getName());
        } else {
            formContract = new FormContract(formUUID, form.getLastModifiedBy().getUuid(), form.getName(), null);
        }

        Set<FormElementGroup> formElementGroups = form.getFormElementGroups();
        formElementGroups.forEach(formElementGroup -> {
            FormElementGroupContract formElementGroupContract = new FormElementGroupContract(formElementGroup.getUuid(), null, formElementGroup.getName(), formElementGroup.getDisplayOrder());
            formContract.addFormElementGroup(formElementGroupContract);
            formElementGroup.getFormElements().forEach(formElement -> {
                String conceptName = formElement.isFormElementNameSameAsConceptName() ? null : formElement.getConcept().getName();
                FormElementContract formElementContract = new FormElementContract(formElement.getUuid(), null, formElement.getName(), formElement.isMandatory(), formElement.getKeyValues(), conceptName, formElement.getConcept().getDataType());
                if (ConceptDataType.Coded.toString().equals(formElement.getConcept().getDataType())) {
                    List<String> answers = formElement.getConcept().getConceptAnswers().stream().map(conceptAnswer -> conceptAnswer.getAnswerConcept().getName()).collect(Collectors.toList());
                    formElementContract.setAnswers(answers);
                }
                formElementGroupContract.addFormElement(formElementContract);
            });
        });

        return formContract;
    }
}