package org.openchs.builder;

import org.openchs.application.Form;
import org.openchs.dao.application.FormRepository;
import org.openchs.domain.ChecklistDetail;
import org.openchs.domain.ChecklistItemDetail;
import org.openchs.domain.ChecklistItemStatus;
import org.openchs.domain.Concept;
import org.openchs.framework.ApplicationContextProvider;
import org.openchs.service.ConceptService;
import org.openchs.web.request.ConceptContract;
import org.openchs.web.request.application.ChecklistItemStatusRequest;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ChecklistItemDetailBuilder extends BaseBuilder<ChecklistItemDetail, ChecklistItemDetailBuilder> {

    public ChecklistItemDetailBuilder(ChecklistDetail checklistDetail, ChecklistItemDetail existingEntity) {
        super(existingEntity, new ChecklistItemDetail());
        checklistDetail.addItem(this.get());
        this.get().setChecklistDetail(checklistDetail);
        if (existingEntity == null) {
            checklistDetail.addItem(this.get());
        }
    }

    public ChecklistItemDetailBuilder withConcept(Concept concept) {
        this.set("Concept", concept, Concept.class);
        return this;
    }

    private ChecklistItemStatus makeStatus(List<ChecklistItemStatusRequest> states) {
        ChecklistItemStatus checklistItemStatus = new ChecklistItemStatus();
        states.forEach((state) -> {
            Map<String, Object> dbState = new HashMap<>();
            dbState.put("displayOrder", state.getDisplayOrder());
            dbState.put("state", state.getState());
            dbState.put("color", state.getColor());
            dbState.put("from", state.getFrom());
            dbState.put("to", state.getTo());
            checklistItemStatus.add(dbState);
        });
        return checklistItemStatus;
    }

    public ChecklistItemDetailBuilder withVoided(Boolean voided) {
        this.get().setVoided(voided);
        return this;
    }

    public ChecklistItemDetailBuilder withChecklistItemStatus(List<ChecklistItemStatusRequest> checklistItemStatuses) {
        this.get().setChecklistItemStatus(this.makeStatus(checklistItemStatuses));
        return this;
    }

    public ChecklistItemDetailBuilder withform(Form form) {
        this.set("Form", form, Form.class);
        return this;
    }
}
