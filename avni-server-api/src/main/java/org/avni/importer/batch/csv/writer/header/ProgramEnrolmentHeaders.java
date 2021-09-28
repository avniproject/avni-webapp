package org.avni.importer.batch.csv.writer.header;

public class ProgramEnrolmentHeaders implements Headers {
    public final String id = "Id";
    public final String subjectId = "Subject Id";
    public final String program = "Program";
    public final String enrolmentDate = "Enrolment Date";
    public final String exitDate = "Exit Date";
    public final String enrolmentLocation = "Enrolment Location";
    public final String exitLocation = "Exit Location";

    @Override
    public String[] getAllHeaders() {
        return new String[]{id, subjectId, program, enrolmentDate, exitDate, enrolmentLocation, exitLocation};
    }
}
