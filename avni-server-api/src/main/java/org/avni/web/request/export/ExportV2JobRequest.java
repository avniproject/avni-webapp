package org.avni.web.request.export;

import org.avni.domain.ExportJobParameters;
import org.avni.domain.JsonObject;
import org.avni.framework.security.UserContextHolder;

import java.util.Collections;
import java.util.List;
import java.util.Map;

public class ExportV2JobRequest {
    private JsonObject filters;
    private JsonObject output;
    private String timezone;

    public ExportJobParameters buildJobParameters() {
        ExportJobParameters exportJobParameters = new ExportJobParameters();
        exportJobParameters.setTimezone(this.getTimezone());
        exportJobParameters.setFilter(this.getFilters());
        exportJobParameters.setOutput(this.getOutput());
        exportJobParameters.setUser(UserContextHolder.getUser());
        exportJobParameters.assignUUID();
        return exportJobParameters;
    }


    public JsonObject getFilters() {
        return filters;
    }

    public void setFilters(JsonObject filters) {
        this.filters = filters;
    }

    public JsonObject getOutput() {
        return output;
    }

    public void setOutput(JsonObject output) {
        this.output = output;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public List<String> getAddressIds() {
        return (List<String>) filters.getOrDefault("addressLevelIds", Collections.EMPTY_LIST);
    }

    private Map<String, String> getDateFilter() {
        return (Map<String, String>) filters.get("date");
    }

    public String getToDate() {
        return this.getDateFilter().get("to");
    }

    public String getFromDate() {
        return this.getDateFilter().get("from");
    }

}
