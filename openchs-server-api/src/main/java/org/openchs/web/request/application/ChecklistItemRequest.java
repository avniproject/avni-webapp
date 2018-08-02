package org.openchs.web.request.application;

import org.joda.time.DateTime;
import org.joda.time.LocalDate;
import org.openchs.web.request.CHSRequest;
import org.openchs.web.request.ObservationRequest;

import java.util.List;
import java.util.Map;

public class ChecklistItemRequest extends CHSRequest {
    private DateTime completionDate;
    private String checklistUUID;
    private List<ObservationRequest> observations;
    private String checklistItemDetailUUID;

    public DateTime getCompletionDate() {
        return completionDate;
    }

    public void setCompletionDate(DateTime completionDate) {
        this.completionDate = completionDate;
    }

    public String getChecklistUUID() {
        return checklistUUID;
    }

    public void setChecklistUUID(String checklistUUID) {
        this.checklistUUID = checklistUUID;
    }

    public List<ObservationRequest> getObservations() {
        return observations;
    }

    public void setObservations(List<ObservationRequest> observations) {
        this.observations = observations;
    }

    public String getChecklistItemDetailUUID() {
        return checklistItemDetailUUID;
    }

    public void setChecklistItemDetailUUID(String checklistItemDetailUUID) {
        this.checklistItemDetailUUID = checklistItemDetailUUID;
    }
}