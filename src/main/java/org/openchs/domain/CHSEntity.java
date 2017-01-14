package org.openchs.domain;

import org.joda.time.DateTime;
import org.springframework.data.annotation.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import javax.persistence.Id;
import javax.persistence.Version;
import javax.validation.constraints.NotNull;

@MappedSuperclass
@EntityListeners({AuditingEntityListener.class})
public class CHSEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @CreatedBy
    @ManyToOne(targetEntity = User.class)
    private User createdBy;

    @CreatedDate
    private DateTime createdDateTime;

    @LastModifiedBy
    @ManyToOne(targetEntity = User.class)
    private User lastModifiedBy;

    @LastModifiedDate
    private DateTime lastModifiedDateTime;

    @Version
    @Column(name = "version")
    private int version;

    @Column
    @NotNull
    private String uuid;

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public DateTime getCreatedDateTime() {
        return createdDateTime;
    }

    public void setCreatedDateTime(DateTime createdDateTime) {
        this.createdDateTime = createdDateTime;
    }

    public User getLastModifiedBy() {
        return lastModifiedBy;
    }

    public void setLastModifiedBy(User lastModifiedBy) {
        this.lastModifiedBy = lastModifiedBy;
    }

    public DateTime getLastModifiedDateTime() {
        return lastModifiedDateTime;
    }

    public void setLastModifiedDateTime(DateTime lastModifiedDateTime) {
        this.lastModifiedDateTime = lastModifiedDateTime;
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

    public int getVersion() {
        return version;
    }

    public void setVersion(int version) {
        this.version = version;
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

    public boolean isNew() {
        Long id = getId();
        return (id == null || id == 0);
    }
}