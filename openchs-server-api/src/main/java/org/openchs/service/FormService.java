package org.openchs.service;

import org.openchs.application.Form;
import org.openchs.application.FormType;
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
                .withChecklistRule(formRequest.getChecklistsRule())
                .withVoided(formRequest.isVoided())
                .build();
        //Form audit values might not change for changes in form element groups or form elements.
        //This updateAudit forces audit updates
        form.updateAudit();
        formRepository.save(form);
    }

    public Form getOrCreateForm(String formUuid, String formName, FormType formType) {
        Form form = formRepository.findByUuid(formUuid);
        if (form != null) {
            return form;
        }

        form = Form.create();
        form.setName(formName);
        form.assignUUID();
        form.setFormType(formType);
        formRepository.save(form);
        return form;
    }
}
