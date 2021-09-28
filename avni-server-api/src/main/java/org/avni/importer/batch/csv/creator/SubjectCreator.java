package org.avni.importer.batch.csv.creator;

import org.avni.dao.IndividualRepository;
import org.avni.domain.Individual;
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

    public Individual getSubject(String legacyId, List<String> errorMsgs, String identifierForErrorMessage) {
        if (legacyId == null || legacyId.isEmpty()) {
            errorMsgs.add(String.format("'%s' is required", identifierForErrorMessage));
            return null;
        }
        Individual individual = individualRepository.findByLegacyId(legacyId);
        if (individual == null) {
            errorMsgs.add(String.format("'%s' not found in database", identifierForErrorMessage));
            return null;
        }
        return individual;
    }
}
