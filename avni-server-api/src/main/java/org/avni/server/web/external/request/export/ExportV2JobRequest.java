package org.avni.server.web.external.request.export;

import org.avni.server.domain.ExportJobParameters;
import org.avni.server.domain.JsonObject;
import org.avni.server.framework.security.UserContextHolder;

public class ExportV2JobRequest {
    private JsonObject individual;
    private String timezone;

    public ExportJobParameters buildJobParameters() {
        ExportJobParameters exportJobParameters = new ExportJobParameters();
        exportJobParameters.setTimezone(this.getTimezone());
        exportJobParameters.setReportFormat(this.getIndividual());
        exportJobParameters.setUser(UserContextHolder.getUser());
        exportJobParameters.assignUUID();
        return exportJobParameters;
    }

    public JsonObject getIndividual() {
        return individual;
    }

    public void setIndividual(JsonObject individual) {
        this.individual = individual;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

}
