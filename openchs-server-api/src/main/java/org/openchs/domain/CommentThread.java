package org.openchs.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.BatchSize;
import org.joda.time.DateTime;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "comment_thread")
@BatchSize(size = 100)
@JsonIgnoreProperties({"comments"})
public class CommentThread extends OrganisationAwareEntity {

    @NotNull
    @Enumerated(EnumType.STRING)
    private CommentThreadStatus status;

    @Column
    @NotNull
    private DateTime openDateTime;

    @Column
    private DateTime resolvedDateTime;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "commentThread")
    private Set<Comment> comments = new HashSet<>();

    public CommentThreadStatus getStatus() {
        return status;
    }

    public void setStatus(CommentThreadStatus status) {
        this.status = status;
    }

    public DateTime getOpenDateTime() {
        return openDateTime;
    }

    public void setOpenDateTime(DateTime openDateTime) {
        this.openDateTime = openDateTime;
    }

    public DateTime getResolvedDateTime() {
        return resolvedDateTime;
    }

    public void setResolvedDateTime(DateTime resolvedDateTime) {
        this.resolvedDateTime = resolvedDateTime;
    }

    public Set<Comment> getComments() {
        return comments;
    }

    public void setComments(Set<Comment> comments) {
        this.comments = comments;
    }

    public enum CommentThreadStatus {
        Open,
        Resolved
    }
}
