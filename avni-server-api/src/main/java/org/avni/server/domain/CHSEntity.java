package org.avni.server.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.avni.server.framework.security.UserContextHolder;
import org.joda.time.DateTime;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.Date;

@MappedSuperclass
@EntityListeners({AuditingEntityListener.class})
public class CHSEntity extends CHSBaseEntity implements Auditable{

    @JsonIgnore
    @JoinColumn(name = "created_by_id")
    @CreatedBy
    @ManyToOne(targetEntity = User.class, fetch = FetchType.LAZY)
    @NotNull
    private User createdBy;

    @CreatedDate
    @NotNull
    private Date createdDateTime;

    @JsonIgnore
    @JoinColumn(name = "last_modified_by_id")
    @LastModifiedBy
    @ManyToOne(targetEntity = User.class, fetch = FetchType.LAZY)
    @NotNull
    private User lastModifiedBy;

    @LastModifiedDate
    @NotNull
    private Date lastModifiedDateTime;

    @JsonIgnore
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
        this.createdDateTime = createdDateTime.toDate();
    }

    @JsonIgnore
    public User getLastModifiedBy() {
        return lastModifiedBy;
    }

    public void setLastModifiedBy(User lastModifiedBy) {
        this.lastModifiedBy = lastModifiedBy;
    }

    public DateTime getLastModifiedDateTime() {
        return toJodaDateTime();
    }

    private DateTime toJodaDateTime() {
        return new DateTime(lastModifiedDateTime);
    }

    public void setLastModifiedDateTime(DateTime lastModifiedDateTime) {
        this.lastModifiedDateTime = lastModifiedDateTime.toDate();
    }

    @Column(name = "version")
    private int version;


    public void updateLastModifiedDateTime() {
        this.setLastModifiedDateTime(DateTime.now());
    }

    /**
     * Update audit values for an entity. If an entity has changed, the
     * infrastructure automatically updates audit values. However, this does not
     * apply when children updates. This method does a force update of audit.
     *
     * This needs to be used only when absolutely necessary.
     */
    public void updateAudit() {
        this.setLastModifiedBy(UserContextHolder.getUser());
        this.setLastModifiedDateTime(DateTime.now());
    }

    public int getVersion() {
        return version;
    }

    public void setVersion(int version) {
        this.version = version;
    }

    @JsonIgnore
    public boolean isNew() {
        Long id = this.getId();
        return (id == null || id == 0);
    }

    @JsonProperty(value = "createdBy")
    public String getCreatedByName() {
        return getCreatedBy().getUsername();
    }

    @JsonProperty(value = "lastModifiedBy")
    public String getLastModifiedByName() {
        return getLastModifiedBy().getUsername();
    }

    public static Date toDate(DateTime dateTime) {
        return dateTime == null ? null : dateTime.toDate();
    }
}
