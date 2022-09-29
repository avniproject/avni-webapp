package org.avni.server.web.request;

public class UserSubjectAssignmentContract extends CHSRequest {
    private Long userId;
    private Long subjectId;

    public void setUserId(Long id) {
        this.userId = id;
    }

    public void setSubjectId(Long id) {
        this.subjectId = id;
    }

    public Long getUserId() {
        return userId;
    }

    public Long getSubjectId() {
        return subjectId;
    }
}
