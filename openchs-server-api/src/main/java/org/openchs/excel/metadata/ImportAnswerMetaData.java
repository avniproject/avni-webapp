package org.openchs.excel.metadata;

public class ImportAnswerMetaData {
    private String systemAnswer;
    private String userAnswer;

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
}