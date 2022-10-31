package org.avni.server.importer.batch.csv.writer.header;

import org.avni.server.domain.SubjectType;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class SubjectHeaders implements Headers {
    public final static String id = "Id";
    public final static String subjectTypeHeader = "Subject Type";
    public final static String firstName = "First Name";
    public final static String middleName = "Middle Name";
    public final static String lastName = "Last Name";
    public final static String profilePicture = "Profile Picture";
    public final static String dateOfBirth = "Date Of Birth";
    public final static String dobVerified = "Date Of Birth Verified";
    public final static String registrationDate = "Date Of Registration";
    public final static String registrationLocation = "Registration Location";
    public final static String gender = "Gender";
    private final SubjectType subjectType;

    public SubjectHeaders(SubjectType subjectType) {
        this.subjectType = subjectType;
    }

    @Override
    public String[] getAllHeaders() {
        List<String> headers = new ArrayList<>(Arrays.asList(id, subjectTypeHeader, firstName));
        if (subjectType.isAllowMiddleName())
            headers.add(middleName);
        headers.addAll(Arrays.asList(lastName, profilePicture, dateOfBirth, dobVerified, registrationDate, registrationLocation, gender));
        return headers.toArray(new String[0]);
    }
}
