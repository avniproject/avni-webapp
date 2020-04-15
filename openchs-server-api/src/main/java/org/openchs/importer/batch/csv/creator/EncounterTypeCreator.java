package org.openchs.importer.batch.csv.creator;

import org.openchs.dao.EncounterTypeRepository;
import org.openchs.domain.EncounterType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class EncounterTypeCreator {
    private EncounterTypeRepository encounterTypeRepository;

    @Autowired
    public EncounterTypeCreator(EncounterTypeRepository encounterTypeRepository) {
        this.encounterTypeRepository = encounterTypeRepository;
    }

    public EncounterType getEncounterType(String name, List<String> errorMsgs, String identifierForErrorMessage) {
        if (name == null || name.isEmpty()) {
            errorMsgs.add(String.format("'%s' is required", identifierForErrorMessage));
            return null;
        }
        EncounterType encounterType = encounterTypeRepository.findByName(name);
        if (encounterType == null) {
            errorMsgs.add(String.format("'%s' not found in database", identifierForErrorMessage));
            return null;
        }
        return encounterType;
    }
}
