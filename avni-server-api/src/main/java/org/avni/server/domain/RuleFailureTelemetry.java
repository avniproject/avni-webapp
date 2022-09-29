package org.avni.server.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.joda.time.DateTime;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

import java.util.Date;

@Entity
@Table(name = "rule_failure_telemetry")
@BatchSize(size = 100)
public class RuleFailureTelemetry {
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    @Id
    private Long id;

    @Column
    @NotNull
    private String uuid;

    @ManyToOne(fetch = FetchType.LAZY)
    @NotNull
    @JoinColumn(name = "user_id")
    private User user;

    @Column
    private String ruleUuid;

    @Column
    private String individualUuid;

    @Column
    private String errorMessage;

    @Column
    private String stacktrace;

    @Column
    private DateTime closeDateTime;

    @Column
    private DateTime errorDateTime;

    @Column
    private Boolean isClosed;
    @Column
    private Long organisationId;

    @JsonIgnore
    @JoinColumn(name = "created_by_id")
    @CreatedBy
    @ManyToOne(targetEntity = User.class)
    @Fetch(FetchMode.JOIN)
    @NotNull
    private User createdBy;

    @CreatedDate
    private Date createdDateTime;

    @JsonIgnore
    @JoinColumn(name = "last_modified_by_id")
    @LastModifiedBy
    @ManyToOne(targetEntity = User.class)
    @Fetch(FetchMode.JOIN)
    @NotNull
    private User lastModifiedBy;

    @LastModifiedDate
    private Date lastModifiedDateTime;

    @Column(name = "version")
    private int version;

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public DateTime getCreatedDateTime() {
        return new DateTime(createdDateTime);
    }

    public void setCreatedDateTime(DateTime createdDateTime) {
        this.createdDateTime = createdDateTime == null ? null : createdDateTime.toDate();
    }

    public User getLastModifiedBy() {
        return lastModifiedBy;
    }

    public void setLastModifiedBy(User lastModifiedBy) {
        this.lastModifiedBy = lastModifiedBy;
    }

    public DateTime getLastModifiedDateTime() {
        return new DateTime(lastModifiedDateTime);
    }

    public void setLastModifiedDateTime(DateTime lastModifiedDateTime) {
        this.lastModifiedDateTime = lastModifiedDateTime == null ? null : lastModifiedDateTime.toDate();
    }

    public void updateLastModifiedDateTime() {
        this.setLastModifiedDateTime(DateTime.now());
    }

    public int getVersion() {
        return version;
    }

    public void setVersion(int version) {
        this.version = version;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getRuleUuid() {
        return ruleUuid;
    }

    public void setRuleUuid(String ruleUuid) {
        this.ruleUuid = ruleUuid;
    }

    public String getIndividualUuid() {
        return individualUuid;
    }

    public void setIndividualUuid(String individualUuid) {
        this.individualUuid = individualUuid;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public String getStacktrace() {
        return stacktrace;
    }

    public void setStacktrace(String stacktrace) {
        this.stacktrace = stacktrace;
    }

    public DateTime getCloseDateTime() {
        return closeDateTime;
    }

    public void setCloseDateTime(DateTime closeDateTime) {
        this.closeDateTime = closeDateTime;
    }

    public DateTime getErrorDateTime() {
        return errorDateTime;
    }

    public void setErrorDateTime(DateTime errorDateTime) {
        this.errorDateTime = errorDateTime;
    }

    public Boolean getClosed() {
        return isClosed;
    }

    public void setClosed(Boolean closed) {
        isClosed = closed;
    }

    public Long getOrganisationId() {
        return organisationId;
    }

    public void setOrganisationId(Long organisationId) {
        this.organisationId = organisationId;
    }
}
