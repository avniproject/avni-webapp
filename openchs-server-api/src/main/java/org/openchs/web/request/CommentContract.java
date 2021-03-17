package org.openchs.web.request;

public class CommentContract extends CHSRequest {
    private String text;
    private String SubjectUUID;

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getSubjectUUID() {
        return SubjectUUID;
    }

    public void setSubjectUUID(String subjectUUID) {
        SubjectUUID = subjectUUID;
    }
}
