package org.avni.server.importer.batch.csv.creator;

import org.avni.server.dao.ProgramEnrolmentRepository;
import org.avni.server.domain.ProgramEnrolment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ProgramEnrolmentCreator {
    private ProgramEnrolmentRepository programEnrolmentRepository;

    @Autowired
    public ProgramEnrolmentCreator(ProgramEnrolmentRepository programEnrolmentRepository) {
        this.programEnrolmentRepository = programEnrolmentRepository;
    }

    public ProgramEnrolment getProgramEnrolment(String enrolmentId, String identifierForErrorMessage) throws Exception {
        if (enrolmentId == null || enrolmentId.isEmpty()) {
            throw new Exception(String.format("'%s' is required", identifierForErrorMessage));
        }
        ProgramEnrolment programEnrolment = programEnrolmentRepository.findByLegacyIdOrUuid(enrolmentId);
        if (programEnrolment == null) {
            throw new Exception(String.format("'%s' id '%s' not found in database", identifierForErrorMessage, enrolmentId));
        }
        return programEnrolment;
    }
}
