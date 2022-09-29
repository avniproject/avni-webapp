package org.avni.server.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.BatchSize;
import org.avni.server.util.S;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "comment")
@BatchSize(size = 100)
@JsonIgnoreProperties({"subject", "commentThread"})
public class Comment extends OrganisationAwareEntity {

    @NotNull
    private String text;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subject_id")
    private Individual subject;

    @NotNull
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "comment_thread_id")
    private CommentThread commentThread;

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Individual getSubject() {
        return subject;
    }

    public void setSubject(Individual subject) {
        this.subject = subject;
    }

    public String getSubjectUUID() {
        return this.subject.getUuid();
    }

    public CommentThread getCommentThread() {
        return commentThread;
    }

    public void setCommentThread(CommentThread commentThread) {
        this.commentThread = commentThread;
    }

    public String getDisplayUsername() {
        User createdByUser = this.getCreatedBy();
        return S.isEmpty(createdByUser.getName()) ? createdByUser.getUsername() : createdByUser.getName();
    }

    public String getCommentThreadUUID() {
        return this.commentThread.getUuid();
    }
}
