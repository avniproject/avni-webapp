package org.avni.server.web.request;

public class CommentContract extends CHSRequest {
    private String text;
    private String subjectUUID;
    private String commentThreadUUID;

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getSubjectUUID() {
        return subjectUUID;
    }

    public void setSubjectUUID(String subjectUUID) {
        this.subjectUUID = subjectUUID;
    }

    public String getCommentThreadUUID() {
        return commentThreadUUID;
    }

    public void setCommentThreadUUID(String commentThreadUUID) {
        this.commentThreadUUID = commentThreadUUID;
    }
}
