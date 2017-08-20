package org.openchs.excel;

import java.util.LinkedList;

public class ContentTypeSequence {
    private static LinkedList<ContentType> contentTypes = new LinkedList<ContentType>();
    private int currentPointer;

    public ContentTypeSequence() {
        contentTypes.add(ContentType.RegistrationHeader);
        contentTypes.add(ContentType.Registration);
        contentTypes.add(ContentType.None);
        contentTypes.add(ContentType.EnrolmentHeader);
        contentTypes.add(ContentType.Enrolment);
        contentTypes.add(ContentType.None);
        contentTypes.add(ContentType.EncounterHeader);
        contentTypes.add(ContentType.Encounter);
    }

    ContentType getNextType(ContentType currentContentType, String text) {
        if (currentContentType == null)
            return contentTypes.get(currentPointer);
        else if (currentContentType == ContentType.None && isEmpty(text))
            return currentContentType;
        else if (currentContentType == ContentType.None && !isEmpty(text))
            return contentTypes.get(++currentPointer);
        else if (currentContentType.toString().contains("Header"))
            return contentTypes.get(++currentPointer);
        else if (!currentContentType.toString().contains("Header") && !isEmpty(text))
            return currentContentType;
        else if (!currentContentType.toString().contains("Header") && isEmpty(text))
            return contentTypes.get(++currentPointer);

        throw new RuntimeException();
    }

    private boolean isEmpty(String text) {
        return text == null || text.trim().equals("");
    }
}