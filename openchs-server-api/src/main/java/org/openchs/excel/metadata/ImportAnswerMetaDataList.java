package org.openchs.excel.metadata;

import java.util.ArrayList;

public class ImportAnswerMetaDataList extends ArrayList<ImportAnswerMetaData> {
    public String getSystemAnswer(String userAnswer) {
        ImportAnswerMetaData matchingAnswerMetaData = this.stream().filter(answerMetaData -> answerMetaData.getUserAnswer().equals(userAnswer)).findAny().orElse(null);
        if (matchingAnswerMetaData == null) return userAnswer;
        return matchingAnswerMetaData.getSystemAnswer();
    }
}