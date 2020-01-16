package org.openchs.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.joda.time.DateTime;

import javax.persistence.*;

@MappedSuperclass
public class CHSEntity extends CHSBaseEntity {

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

    public DateTime getCreatedDateTime() {
        return getAudit().getCreatedDateTime();
    }

    public String getCreatedBy() {
        return getAudit().getCreatedBy().getUsername();
    }

    public String getLastModifiedBy() {
        return getAudit().getLastModifiedBy().getUsername();
    }

    public Long getAuditId() {
        return getAudit().getId();
    }


    @JsonIgnore
    public boolean isNew() {
        Long id = this.getId();
        return (id == null || id == 0);
    }
}
