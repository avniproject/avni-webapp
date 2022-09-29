package org.avni.server.web.request;

import org.joda.time.DateTime;

import java.util.HashSet;
import java.util.Set;

public class CommentThreadContract extends CHSRequest {

    private String status;
    private DateTime openDateTime;
    private DateTime resolvedDateTime;
    private Set<CommentContract> comments = new HashSet<>();

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

    public Set<CommentContract> getComments() {
        return comments;
    }

    public void setComments(Set<CommentContract> comments) {
        this.comments = comments;
    }
}
