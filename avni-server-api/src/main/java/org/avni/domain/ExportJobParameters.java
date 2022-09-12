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

    @Column(name = "output")
    @Type(type = "jsonObject")
    @NotNull
    private JsonObject output;

    @Column(name = "filter")
    @Type(type = "jsonObject")
    @NotNull
    private JsonObject filter;

    @Column(name = "timezone")
    @NotNull
    private String timezone;

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    public JsonObject getFilter() {
        return filter;
    }

    public void setFilter(JsonObject filter) {
        this.filter = filter;
    }
}
