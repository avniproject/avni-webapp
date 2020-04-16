package org.openchs.importer.batch.csv.creator;

import org.openchs.dao.ProgramEnrolmentRepository;
import org.openchs.domain.ProgramEnrolment;
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

    public ProgramEnrolment getProgramEnrolment(String legacyId, List<String> errorMsgs, String identifierForErrorMessage) {
        if (legacyId == null || legacyId.isEmpty()) {
            errorMsgs.add(String.format("'%s' is required", identifierForErrorMessage));
            return null;
        }
        ProgramEnrolment programEnrolment = programEnrolmentRepository.findByLegacyId(legacyId);
        if (programEnrolment == null) {
            errorMsgs.add(String.format("'%s' not found in database", identifierForErrorMessage));
            return null;
        }
        return programEnrolment;
    }
}
