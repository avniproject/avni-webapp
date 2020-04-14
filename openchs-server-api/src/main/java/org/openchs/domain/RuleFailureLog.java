package org.openchs.domain;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.joda.time.DateTime;
import javax.persistence.*;
import javax.validation.constraints.NotNull;
@Entity
@Table(name = "rule_failure_log")
public class RuleFailureLog {
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    @Id
    private Long id;
    @Column
    @NotNull
    private String form_id;
    @Column
    private String rule_type;
    @Column
    private String entity_type;
    @Column
    private String entity_id;
    @Column
    private String error_message;
    @Column
    private String stacktrace;
    @Column
    private String source;
    @JsonIgnore
    @JoinColumn(name = "audit_id")
    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private Audit audit = new Audit();

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
    public String getForm_id() {
        return form_id;
    }
    public void setForm_id(String form_id) {
        this.form_id = form_id;
    }
    public String getRule_type() {
        return rule_type;
    }
    public void setRule_type(String rule_type) {
        this.rule_type = rule_type;
    }
    public String getEntity_type() {
        return entity_type;
    }
    public void setEntity_type(String entity_type) {
        this.entity_type = entity_type;
    }
    public String getEntity_id() {
        return entity_id;
    }
    public void setEntity_id(String entity_id) {
        this.entity_id = entity_id;
    }
    public String getError_message() {
        return error_message;
    }
    public void setError_message(String error_message) {
        this.error_message = error_message;
    }
    public String getStacktrace() {
        return stacktrace;
    }
    public void setStacktrace(String stacktrace) {
        this.stacktrace = stacktrace;
    }
    public String getSource() {
        return source;
    }
    public void setSource(String source) {
        this.source = source;
    }
}