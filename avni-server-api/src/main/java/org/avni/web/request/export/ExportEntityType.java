package org.avni.web.request.export;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ExportEntityType {

    public static final long NO_OF_AUDIT_FIELDS = 4l;
    private String uuid;
    private List<String> fields = new ArrayList<>();
    private ExportFilters filters;
    private long maxCount = 1;

    public ExportFilters getFilters() {
        return filters == null ? new ExportFilters() : filters;
    }

    public boolean isDateEmpty() {
        return this.filters == null || this.filters.getDate() == null ||
                this.filters.getDate().getTo() == null;
    }

    public void setFilters(ExportFilters filters) {
        this.filters = filters;
    }

    public long getMaxCount() {
        return maxCount;
    }

    public void setMaxCount(long maxCount) {
        this.maxCount = maxCount;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public List<String> getFields() {
        return fields;
    }

    public boolean isEmptyOrContains(String conceptUUID) {
        return fields.isEmpty() || fields.contains(conceptUUID);
    }

    public void setFields(List<String> fields) {
        this.fields = fields;
    }

    public long getNoOfFields() {
        return getFields().size();
    }

    public long getTotalNumberOfColumns() {
        return getEffectiveNoOfFields() * getMaxCount();
    }

    public long getEffectiveNoOfFields() {
        return getNoOfFields() + NO_OF_AUDIT_FIELDS;
    }
}
