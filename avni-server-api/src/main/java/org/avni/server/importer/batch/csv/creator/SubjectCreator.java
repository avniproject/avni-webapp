package org.avni.server.importer.batch.csv.creator;

import org.avni.server.dao.IndividualRepository;
import org.avni.server.domain.Individual;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SubjectCreator {

    private IndividualRepository individualRepository;


    @Autowired
    public SubjectCreator(IndividualRepository individualRepository) {
        this.individualRepository = individualRepository;
    }

    public Individual getSubject(String subjectId, List<String> errorMsgs, String identifierForErrorMessage) {
        if (subjectId == null || subjectId.isEmpty()) {
            errorMsgs.add(String.format("'%s' is required", identifierForErrorMessage));
            return null;
        }
        Individual individual = individualRepository.findByLegacyIdOrUuid(subjectId);
        if (individual == null) {
            errorMsgs.add(String.format("'%s' not found in database", identifierForErrorMessage));
            return null;
        }
        return individual;
    }
}
