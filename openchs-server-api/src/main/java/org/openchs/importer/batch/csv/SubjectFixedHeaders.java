package org.openchs.importer.batch.csv;

public class SubjectFixedHeaders implements Headers {
    public static final String id = "Id";
    public static final String subjectType = "Subject Type";
    public static final String firstName = "First Name";
    public static final String lastName = "Last Name";
    public static final String dateOfBirth = "Date Of Birth";
    public static final String dobVerified = "Date Of Birth Verified";
    public static final String registrationDate = "Date Of Registration";
    public static final String registrationLocation = "Registration Location";

    @Override
    public String[] getAllHeaders() {
        return new String[]{id, subjectType, firstName, lastName, dateOfBirth, dobVerified, registrationDate, registrationLocation};
    }
}
