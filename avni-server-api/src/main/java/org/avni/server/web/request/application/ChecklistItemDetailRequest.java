package org.avni.server.web.request.application;

import org.avni.server.domain.ChecklistItemDetail;
import org.avni.server.web.request.CHSRequest;
import org.avni.server.web.request.ConceptContract;

import java.util.ArrayList;
import java.util.List;

public class ChecklistItemDetailRequest extends CHSRequest {
    private ConceptContract concept;
    private List<ChecklistItemStatusRequest> status;
    private String formUUID;
    private String dependentOn;
    private boolean scheduleOnExpiryOfDependency;
    private Integer minDaysFromStartDate;
    private Integer minDaysFromDependent;
    private Integer expiresAfter;


    static ChecklistItemDetailRequest fromEntity(ChecklistItemDetail checklistItemDetail) {
        ChecklistItemDetailRequest request = new ChecklistItemDetailRequest();
        request.setUuid(checklistItemDetail.getUuid());
        request.setConcept(ConceptContract.create(checklistItemDetail.getConcept()));
        request.setStatus(ChecklistItemStatusRequest.fromEntity(checklistItemDetail.getChecklistItemStatus()));
        request.setFormUUID(checklistItemDetail.getForm().getUuid());
        ChecklistItemDetail leadChecklistItemDetail = checklistItemDetail.getLeadChecklistItemDetail();
        request.setDependentOn(leadChecklistItemDetail == null ? null : leadChecklistItemDetail.getUuid());
        request.setScheduleOnExpiryOfDependency(checklistItemDetail.getScheduleOnExpiryOfDependency());
        request.setMinDaysFromStartDate(checklistItemDetail.getMinDaysFromStartDate());
        request.setMinDaysFromDependent(checklistItemDetail.getMinDaysFromDependent());
        request.setExpiresAfter(checklistItemDetail.getExpiresAfter());
        request.setVoided(checklistItemDetail.isVoided());
        return request;
    }

    public ConceptContract getConcept() {
        return concept;
    }

    public void setConcept(ConceptContract concept) {
        this.concept = concept;
    }

    public List<ChecklistItemStatusRequest> getStatus() {
        return status == null ? new ArrayList<>() : this.status;
    }

    public void setStatus(List<ChecklistItemStatusRequest> status) {
        this.status = status;
    }

    public String getFormUUID() {
        return formUUID;
    }

    public void setFormUUID(String formUUID) {
        this.formUUID = formUUID;
    }

    public String getDependentOn() {
        return dependentOn;
    }

    public void setDependentOn(String dependentOn) {
        this.dependentOn = dependentOn;
    }

    public boolean getScheduleOnExpiryOfDependency() {
        return scheduleOnExpiryOfDependency;
    }

    public void setScheduleOnExpiryOfDependency(boolean scheduleOnExpiryOfDependency) {
        this.scheduleOnExpiryOfDependency = scheduleOnExpiryOfDependency;
    }

    public Integer getMinDaysFromStartDate() {
        return minDaysFromStartDate;
    }

    public void setMinDaysFromStartDate(Integer minDaysFromStartDate) {
        this.minDaysFromStartDate = minDaysFromStartDate;
    }

    public Integer getMinDaysFromDependent() {
        return minDaysFromDependent;
    }

    public void setMinDaysFromDependent(Integer minDaysFromDependent) {
        this.minDaysFromDependent = minDaysFromDependent;
    }

    public Integer getExpiresAfter() {
        return expiresAfter;
    }

    public void setExpiresAfter(Integer expiresAfter) {
        this.expiresAfter = expiresAfter;
    }
}
