package org.openchs.service;

import org.openchs.application.Form;
import org.openchs.builder.FormBuilder;
import org.openchs.builder.FormBuilderException;
import org.openchs.dao.application.FormRepository;
import org.openchs.web.request.application.FormContract;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.io.InvalidObjectException;

@Service
public class FormService {

    private FormRepository formRepository;

    public FormService(FormRepository formRepository) {
        this.formRepository = formRepository;
    }

    public void saveForm(FormContract formRequest) throws FormBuilderException {
        Form existingForm = formRepository.findByUuid(formRequest.getUuid());
        FormBuilder formBuilder = new FormBuilder(existingForm);
        Form form = formBuilder.withName(formRequest.getName())
                .withType(formRequest.getFormType())
                .withUUID(formRequest.getUuid())
                .withFormElementGroups(formRequest.getFormElementGroups())
                .withDecisionRule(formRequest.getDecisionRule())
                .withVisitScheduleRule(formRequest.getVisitScheduleRule())
                .withValidationRule(formRequest.getValidationRule())
                .build();
        formRepository.save(form);
    }
}
