package org.avni.server.excel.metadata;

import org.springframework.util.StringUtils;

public class ImportAnswerMetaData {
    private String systemAnswer;
    private String userAnswer;
    private String conceptName;

    private static String NULL = "NULL";

    public String getSystemAnswer() {
        return NULL.equals(systemAnswer) ? null : systemAnswer;
    }

    public void setSystemAnswer(String systemAnswer) {
        this.systemAnswer = systemAnswer;
    }

    public String getUserAnswer() {
        return userAnswer;
    }

    public void setUserAnswer(String userAnswer) {
        this.userAnswer = userAnswer;
    }

    public String getConceptName() {
        return conceptName;
    }

    public void setConceptName(String conceptName) {
        this.conceptName = conceptName;
    }

    public boolean matches(String userAnswer, String conceptName) {
        if(this.getUserAnswer() == null)
        {
            throw new RuntimeException("userAnswer is null for Answer Field:  "+this.conceptName);
        }
        return this.getUserAnswer().equals(userAnswer) && (StringUtils.isEmpty(this.conceptName) || this.conceptName.equals(conceptName));
    }
}
