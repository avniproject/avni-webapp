package org.openchs.importer.batch.csv;

public class ProgramEnrolmentFixedHeaders implements Headers {
    public static final String id = "Id";
    public static final String subjectId = "Subject Id";
    public static final String program = "Program";
    public static final String enrolmentDate = "Enrolment Date";
    public static final String exitDate = "Exit Date";
    public static final String enrolmentLocation = "Enrolment Location";
    public static final String exitLocation = "Exit Location";

    @Override
    public String[] getAllHeaders() {
        return new String[]{id, subjectId, program, enrolmentDate, exitDate, enrolmentLocation, exitLocation};
    }
}
