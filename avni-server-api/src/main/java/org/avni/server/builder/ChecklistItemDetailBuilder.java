package org.avni.server.builder;

import org.avni.server.application.Form;
import org.avni.server.domain.ChecklistDetail;
import org.avni.server.domain.ChecklistItemDetail;
import org.avni.server.domain.ChecklistItemStatus;
import org.avni.server.domain.Concept;
import org.avni.server.web.request.application.ChecklistItemStatusRequest;

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
            dbState.put("start", state.getStart());
            dbState.put("end", state.getEnd());
            checklistItemStatus.add(dbState);
        });
        return checklistItemStatus;
    }

    public ChecklistItemDetailBuilder withVoided(Boolean voided) {
        this.get().setVoided(voided);
        return this;
    }

    public ChecklistItemDetailBuilder withScheduleOnExpiryOfDependency(Boolean scheduleOnExpiryOfDependency) {
        this.get().setScheduleOnExpiryOfDependency(scheduleOnExpiryOfDependency);
        return this;
    }

    public ChecklistItemDetailBuilder withMinDaysFromStartDate(Integer minDaysFromStartDate) {
        this.get().setMinDaysFromStartDate(minDaysFromStartDate);
        return this;
    }

    public ChecklistItemDetailBuilder withMinDaysFromDependent(Integer minDaysFromDependent) {
        this.get().setMinDaysFromDependent(minDaysFromDependent);
        return this;
    }

    public ChecklistItemDetailBuilder withExpiresAfter(Integer expiresAfter) {
        this.get().setExpiresAfter(expiresAfter);
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

    public ChecklistItemDetailBuilder withLeadItem(ChecklistItemDetail checklistItemDetail) {
        this.get().setLeadChecklistItemDetail(checklistItemDetail);
        return this;
    }
}
