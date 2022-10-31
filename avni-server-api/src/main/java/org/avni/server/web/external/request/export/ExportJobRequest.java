package org.avni.server.web.external.request.export;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

public class ExportJobRequest {

    private String encounterTypeUUID;
    private String programUUID;
    private String subjectTypeUUID;
    private Date startDate;
    private Date endDate;
    private ReportType reportType;
    private List<Long> addressLevelIds = new ArrayList<>();
    private String timeZone;
    private boolean includeVoided;

    public String getTimeZone() {
        return timeZone;
    }

    public void setTimeZone(String timeZone) {
        this.timeZone = timeZone;
    }

    public List<Long> getAddressLevelIds() {
        return addressLevelIds;
    }

    public void setAddressLevelIds(List<Long> addressLevelIds) {
        this.addressLevelIds = addressLevelIds;
    }

    public String getAddressLevelString() {
        List<String> stringIds = this.addressLevelIds.stream().map(Object::toString).collect(Collectors.toList());
        return String.join(",", stringIds);
    }

    public ReportType getReportType() {
        return reportType;
    }

    public void setReportType(ReportType reportType) {
        this.reportType = reportType;
    }

    public String getEncounterTypeUUID() {
        return encounterTypeUUID;
    }

    public void setEncounterTypeUUID(String encounterTypeUUID) {
        this.encounterTypeUUID = encounterTypeUUID;
    }

    public String getProgramUUID() {
        return programUUID;
    }

    public void setProgramUUID(String programUUID) {
        this.programUUID = programUUID;
    }

    public String getSubjectTypeUUID() {
        return subjectTypeUUID;
    }

    public void setSubjectTypeUUID(String subjectTypeUUID) {
        this.subjectTypeUUID = subjectTypeUUID;
    }

    public Date getStartDate() {
        return startDate;
    }

    public void setStartDate(Date startDate) {
        this.startDate = startDate;
    }

    public Date getEndDate() {
        return endDate;
    }

    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }

    public boolean isIncludeVoided() {
        return includeVoided;
    }

    public void setIncludeVoided(boolean includeVoided) {
        this.includeVoided = includeVoided;
    }
}
