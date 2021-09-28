package org.avni.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.joda.time.DateTime;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "rule_failure_telemetry")
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
    @JoinColumn(name = "audit_id")
    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private Audit audit = new Audit();

    @Column(name = "version")
    private int version;

    public Audit getAudit() {
        if (audit == null) {
            audit = new Audit();
        }
        return audit;
    }

    public void setAudit(Audit audit) {
        this.audit = audit;
    }

    public void updateLastModifiedDateTime() {
        this.getAudit().setLastModifiedDateTime(new DateTime());
    }

    public int getVersion() {
        return version;
    }

    public void setVersion(int version) {
        this.version = version;
    }

    public DateTime getLastModifiedDateTime() {
        return getAudit().getLastModifiedDateTime();
    }

    public Long getAuditId() {
        return getAudit().getId();
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
