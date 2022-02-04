package org.avni.importer.batch.csv.creator;

import org.avni.dao.ProgramEnrolmentRepository;
import org.avni.domain.ProgramEnrolment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ProgramEnrolmentCreator {
    private ProgramEnrolmentRepository programEnrolmentRepository;

    @Autowired
    public ProgramEnrolmentCreator(ProgramEnrolmentRepository programEnrolmentRepository) {
        this.programEnrolmentRepository = programEnrolmentRepository;
    }

    public ProgramEnrolment getProgramEnrolment(String enrolmentId, List<String> errorMsgs, String identifierForErrorMessage) {
        if (enrolmentId == null || enrolmentId.isEmpty()) {
            errorMsgs.add(String.format("'%s' is required", identifierForErrorMessage));
            return null;
        }
        ProgramEnrolment programEnrolment = programEnrolmentRepository.findByLegacyIdOrUuid(enrolmentId);
        if (programEnrolment == null) {
            errorMsgs.add(String.format("'%s' not found in database", identifierForErrorMessage));
            return null;
        }
        return programEnrolment;
    }
}
