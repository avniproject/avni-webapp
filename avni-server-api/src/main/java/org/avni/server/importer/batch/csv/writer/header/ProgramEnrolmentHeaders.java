package org.avni.server.importer.batch.csv.writer.header;

import org.avni.server.domain.Program;

public class ProgramEnrolmentHeaders implements Headers {
    public final static  String id = "Id";
    public final static String subjectId = "Subject Id";
    public final static String programHeader = "Program";
    public final static String enrolmentDate = "Enrolment Date";
    public final static String exitDate = "Exit Date";
    public final static String enrolmentLocation = "Enrolment Location";
    public final static String exitLocation = "Exit Location";
    private final Program program;

    public ProgramEnrolmentHeaders(Program program) {
        this.program = program;
    }

    @Override
    public String[] getAllHeaders() {
        return new String[]{id, subjectId, programHeader, enrolmentDate, exitDate, enrolmentLocation, exitLocation};
    }
}
