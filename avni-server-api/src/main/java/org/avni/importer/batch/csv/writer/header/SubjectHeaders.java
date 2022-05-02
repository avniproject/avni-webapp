package org.avni.importer.batch.csv.writer.header;

public class SubjectHeaders implements Headers {
    public final String id = "Id";
    public final String subjectType = "Subject Type";
    public final String firstName = "First Name";
    public final String lastName = "Last Name";
    public final String profilePicture = "Profile Picture";
    public final String dateOfBirth = "Date Of Birth";
    public final String dobVerified = "Date Of Birth Verified";
    public final String registrationDate = "Date Of Registration";
    public final String registrationLocation = "Registration Location";
    public final String gender = "Gender";

    @Override
    public String[] getAllHeaders() {
        return new String[]{id, subjectType, firstName, lastName, dateOfBirth, dobVerified, registrationDate, registrationLocation, gender};
    }
}
