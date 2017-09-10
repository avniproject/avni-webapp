package org.openchs.web.request.application;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import org.joda.time.DateTime;
import org.openchs.application.Form;
import org.openchs.web.request.ReferenceDataContract;
import org.springframework.hateoas.ResourceSupport;

import java.util.ArrayList;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({ "name", "uuid", "formType", "programName", "createdDateTime",
        "lastModifiedDate", "createdBy", "lastModifiedBy", "createdByUUID", "lastModifiedByUUID" })
public class BasicFormDetails extends ResourceSupport {
    private String name;
    private String uuid;
    private String formType;
    private String programName;
    private DateTime createDateTime;
    private DateTime lastModifiedDateTime;
    private String createdBy;
    private String lastModifiedBy;
    private String createdByUUID;
    private String lastModifiedByUUID;

    public BasicFormDetails(Form form, String programName) {
        this.name = form.getName();
        this.uuid = form.getUuid();
        this.formType = form.getFormType().name();
        this.programName = programName;
        this.createDateTime = form.getCreatedDateTime();
        this.lastModifiedDateTime = form.getLastModifiedDateTime();
        this.createdBy = form.getCreatedBy().getName();
        this.createdByUUID = form.getCreatedBy().getUuid();
        this.lastModifiedBy = form.getLastModifiedBy().getName();
        this.lastModifiedByUUID = form.getLastModifiedBy().getUuid();
    }

    public String getName() {
        return name;
    }

    public String getUuid() {
        return uuid;
    }

    public String getFormType() {
        return formType;
    }

    public String getProgramName() {
        return programName;
    }

    public DateTime getCreateDateTime() {
        return createDateTime;
    }

    public DateTime getLastModifiedDateTime() {
        return lastModifiedDateTime;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public String getLastModifiedBy() {
        return lastModifiedBy;
    }

    public String getCreatedByUUID() {
        return createdByUUID;
    }

    public String getLastModifiedByUUID() {
        return lastModifiedByUUID;
    }
}