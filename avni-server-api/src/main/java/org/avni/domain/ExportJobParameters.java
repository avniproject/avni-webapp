package org.avni.domain;

import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Type;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "export_job_parameters")
@BatchSize(size = 100)
public class ExportJobParameters extends OrganisationAwareEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @NotNull
    private User user;

    @Column(name = "report_format")
    @Type(type = "jsonObject")
    @NotNull
    private JsonObject reportFormat;

    @Column(name = "timezone")
    @NotNull
    private String timezone;

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public JsonObject getReportFormat() {
        return reportFormat;
    }

    public void setReportFormat(JsonObject reportFormat) {
        this.reportFormat = reportFormat;
    }
}
