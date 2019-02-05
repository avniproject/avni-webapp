package org.openchs.web.request;

public class OperationalSubjectTypeContract extends CHSRequest {
    private CHSRequest subjectType;
    private String name;

    public CHSRequest getSubjectType() {
        return subjectType;
    }

    public void setSubjectType(CHSRequest subjectType) {
        this.subjectType = subjectType;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
