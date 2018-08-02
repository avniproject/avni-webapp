package org.openchs.web.request;

import org.joda.time.DateTime;

public class ChecklistRequest extends CHSRequest {
    private String checklistDetailUUID;
    private DateTime baseDate;
    private String programEnrolmentUUID;

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
}