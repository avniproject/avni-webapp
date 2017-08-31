package org.openchs.excel;

import javax.servlet.Registration;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

public class ContentTypeSequence {
    private static LinkedList<ContentType> contentTypes = new LinkedList<ContentType>();
    private static List<ContentType> dataContentTypes = new ArrayList<ContentType>();
    private static List<ContentType> headerTypes = new ArrayList<ContentType>();
    private static List<ContentType> separatorTypes = new ArrayList<ContentType>();

    public ContentTypeSequence() {
        contentTypes.add(ContentType.RegistrationHeader);
        contentTypes.add(ContentType.Registration);
        contentTypes.add(ContentType.NotRegistration);
        contentTypes.add(ContentType.EnrolmentHeader);
        contentTypes.add(ContentType.Enrolment);
        contentTypes.add(ContentType.NotEnrolment);
        contentTypes.add(ContentType.ProgramEncounterHeader);
        contentTypes.add(ContentType.ProgramEncounter);
        contentTypes.add(ContentType.NotProgramEncounter);

        dataContentTypes.add(ContentType.Registration);
        dataContentTypes.add(ContentType.Enrolment);
        dataContentTypes.add(ContentType.ProgramEncounter);

        headerTypes.add(ContentType.RegistrationHeader);
        headerTypes.add(ContentType.EnrolmentHeader);
        headerTypes.add(ContentType.ProgramEncounterHeader);

        separatorTypes.add(ContentType.NotRegistration);
        separatorTypes.add(ContentType.NotEnrolment);
        separatorTypes.add(ContentType.NotProgramEncounter);
    }

    ContentType getNextType(ContentType currentContentType, String text) {
        if (currentContentType == null)
            return contentTypes.get(0);

        if (dataContentTypes.contains(currentContentType))
            return isEmpty(text) ? next(currentContentType) : currentContentType;

        if (headerTypes.contains(currentContentType))
            return isEmpty(text) ? next(next(currentContentType)) : next(currentContentType);

        if (separatorTypes.contains(currentContentType))
            return isEmpty(text) ? currentContentType : next(currentContentType);

        throw new RuntimeException();
    }

    private ContentType next(ContentType currentContentType) {
        return contentTypes.get(contentTypes.indexOf(currentContentType) + 1);
    }

    private boolean isEmpty(String text) {
        return text == null || text.trim().equals("");
    }
}