package org.openchs.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.NaturalId;
import org.joda.time.DateTime;
import org.springframework.data.annotation.*;
import org.springframework.data.domain.Persistable;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import javax.persistence.Id;
import javax.persistence.Version;
import javax.validation.constraints.NotNull;
import java.util.Objects;
import java.util.Random;
import java.util.UUID;

@MappedSuperclass
public class CHSEntity {
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    @Id
    private Long id;

    public Audit getAudit() {
        if (audit == null) {
            audit = new Audit();
        }
        return audit;
    }

    public void setAudit(Audit audit) {
        this.audit = audit;
    }

    @JoinColumn(name = "audit_id")
    @ManyToOne(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private Audit audit = new Audit();

    @Version
    @Column(name = "version")
    private int version;

    @Column
    @NotNull
    private String uuid;

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

    public void assignUUID() {
        this.uuid = UUID.randomUUID().toString();
    }

    public void assignUUIDIfRequired() {
        if (this.uuid == null) this.assignUUID();
    }

    public int getVersion() {
        return version;
    }

    public void setVersion(int version) {
        this.version = version;
    }

    public User getCreatedBy() {
        return this.getAudit().getCreatedBy();
    }

    public void setCreatedBy(User createdBy) {
        this.getAudit().setCreatedBy(createdBy);
    }

    public DateTime getCreatedDateTime() {
        return audit.getCreatedDateTime();
    }

    public void setCreatedDateTime(DateTime createdDateTime) {
        this.getAudit().setCreatedDateTime(createdDateTime);
    }

    public User getLastModifiedBy() {
        return this.getAudit().getLastModifiedBy();
    }

    public void setLastModifiedBy(User lastModifiedBy) {
        this.getAudit().setLastModifiedBy(lastModifiedBy);
    }

    public DateTime getLastModifiedDateTime() {
        return this.getAudit().getLastModifiedDateTime();
    }

    public void setLastModifiedDateTime(DateTime lastModifiedDateTime) {
        this.getAudit().setLastModifiedDateTime(lastModifiedDateTime);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        CHSEntity chsEntity = (CHSEntity) o;

        if (id != null ? !id.equals(chsEntity.id) : chsEntity.id != null) return false;
        return uuid != null ? uuid.equals(chsEntity.uuid) : chsEntity.uuid == null;
    }

    @Override
    public int hashCode() {
        int result = id != null ? id.hashCode() : 0;
        result = 31 * result + (uuid != null ? uuid.hashCode() : 0);
        return result;
    }

    @JsonIgnore
    public boolean isNew() {
        Long id = this.getId();
        return (id == null || id == 0);
    }
}
