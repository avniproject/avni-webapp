package org.openchs.web.request.application;

import org.joda.time.DateTime;
import org.joda.time.LocalDate;
import org.openchs.web.request.CHSRequest;

import java.util.List;
import java.util.Map;

public class ChecklistItemRequest extends CHSRequest {
    private String conceptUUID;
    private List<ChecklistItemStatusRequest> status;
    private DateTime completionDate;
    private String checklistUUID;

    public String getConceptUUID() {
        return conceptUUID;
    }

    public void setConceptUUID(String conceptUUID) {
        this.conceptUUID = conceptUUID;
    }

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

    public List<ChecklistItemStatusRequest> getStatus() {
        return status;
    }

    public void setStatus(List<ChecklistItemStatusRequest> status) {
        this.status = status;
    }
}