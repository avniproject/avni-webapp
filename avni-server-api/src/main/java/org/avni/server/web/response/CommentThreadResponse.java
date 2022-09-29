package org.avni.server.web.response;

import org.joda.time.DateTime;
import org.avni.server.domain.Comment;
import org.avni.server.domain.CommentThread;
import org.avni.server.web.request.CHSRequest;

import java.util.HashSet;
import java.util.Set;

public class CommentThreadResponse extends CHSRequest {
    private String status;
    private DateTime openDateTime;
    private DateTime resolvedDateTime;
    private Set<Comment> comments = new HashSet<>();

    public static CommentThreadResponse fromEntity(CommentThread commentThread) {
        CommentThreadResponse commentThreadResponse = new CommentThreadResponse();
        commentThreadResponse.setUuid(commentThread.getUuid());
        commentThreadResponse.setVoided(commentThread.isVoided());
        commentThreadResponse.setId(commentThread.getId());
        commentThreadResponse.setStatus(commentThread.getStatus().toString());
        commentThreadResponse.setOpenDateTime(commentThread.getOpenDateTime());
        commentThreadResponse.setResolvedDateTime(commentThread.getResolvedDateTime());
        commentThreadResponse.setComments(commentThread.getNonVoidedComments());
        return commentThreadResponse;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
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
}
