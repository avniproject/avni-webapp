package org.openchs.reporting;

import org.openchs.application.FormElement;
import org.openchs.application.FormMapping;

import java.util.List;

public class ViewSqlCommentGenerator {
    public static String generateComment(FormMapping formMapping) {
        StringBuffer stringBuffer = new StringBuffer();
        List<FormElement> allFormElements = formMapping.getForm().getAllFormElements();
        allFormElements.stream().filter(formElement -> formElement.getConcept().isViewColumnNameTruncated()).forEach(formElement -> stringBuffer.append(String.format("-- %s >> %s\n", formElement.getConcept().getName(), formElement.getConcept().getViewColumnName())));
        return stringBuffer.toString();
    }
}