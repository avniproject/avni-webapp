package org.avni.server.importer.batch.csv.creator;

import org.avni.server.dao.EncounterTypeRepository;
import org.avni.server.domain.EncounterType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class EncounterTypeCreator {
    private EncounterTypeRepository encounterTypeRepository;

    @Autowired
    public EncounterTypeCreator(EncounterTypeRepository encounterTypeRepository) {
        this.encounterTypeRepository = encounterTypeRepository;
    }

    public EncounterType getEncounterType(String name, String identifierForErrorMessage) throws Exception {
        if (name == null || name.isEmpty()) {
            throw new Exception(String.format("'%s' is required", identifierForErrorMessage));
        }
        EncounterType encounterType = encounterTypeRepository.findByName(name);
        if (encounterType == null) {
            throw new Exception(String.format("'%s' '%s' is required", identifierForErrorMessage, name));
        }
        return encounterType;
    }
}
