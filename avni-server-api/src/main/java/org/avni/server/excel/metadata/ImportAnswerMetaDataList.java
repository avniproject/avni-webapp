package org.avni.server.excel.metadata;

import java.util.ArrayList;

public class ImportAnswerMetaDataList extends ArrayList<ImportAnswerMetaData> {
    public String getSystemAnswer(String userAnswer, String conceptName) {
        ImportAnswerMetaData matchingAnswerMetaData = this.stream().filter(answerMetaData -> answerMetaData.matches(userAnswer, conceptName)).findAny().orElse(null);
        if (matchingAnswerMetaData == null) return userAnswer;
        return matchingAnswerMetaData.getSystemAnswer();
    }
}
