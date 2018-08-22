package org.openchs.web.request;

import org.joda.time.DateTime;
import org.openchs.web.request.application.ChecklistItemRequest;

import java.util.List;

public class ChecklistRequest extends CHSRequest {
    private String checklistDetailUUID;
    private DateTime baseDate;
    private String programEnrolmentUUID;
    private List<ChecklistItemRequest> checklistItemRequestList;

    public String getChecklistDetailUUID() {
        return checklistDetailUUID;
    }

    public void setChecklistDetailUUID(String checklistDetailUUID) {
        this.checklistDetailUUID = checklistDetailUUID;
    }

    public DateTime getBaseDate() {
        return baseDate;
    }

    public void setBaseDate(DateTime baseDate) {
        this.baseDate = baseDate;
    }

    public String getProgramEnrolmentUUID() {
        return programEnrolmentUUID;
    }

    public void setProgramEnrolmentUUID(String programEnrolmentUUID) {
        this.programEnrolmentUUID = programEnrolmentUUID;
    }

    public List<ChecklistItemRequest> getChecklistItemRequestList() {
        return checklistItemRequestList;
    }

    public void setChecklistItemRequestList(List<ChecklistItemRequest> checklistItemRequestList) {
        this.checklistItemRequestList = checklistItemRequestList;
    }
}