package org.openchs.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.joda.time.DateTime;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;

@Entity
@EntityListeners({AuditingEntityListener.class})
@Table(name = "audit")
@BatchSize(size = 100)
public class Audit {

    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    @Id
    private Long id;

    @JsonIgnore
    @JoinColumn(name = "created_by_id")
    @CreatedBy
    @ManyToOne(targetEntity = User.class)
    @Fetch(FetchMode.JOIN)
    private User createdBy;

    @CreatedDate
    private DateTime createdDateTime;

    @JsonIgnore
    @JoinColumn(name = "last_modified_by_id")
    @LastModifiedBy
    @ManyToOne(targetEntity = User.class)
    @Fetch(FetchMode.JOIN)
    private User lastModifiedBy;

    @LastModifiedDate
    private DateTime lastModifiedDateTime;

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
}
