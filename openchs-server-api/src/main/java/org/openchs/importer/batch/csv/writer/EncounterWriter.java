package org.openchs.importer.batch.csv.writer;

import org.openchs.application.FormMapping;
import org.openchs.application.FormType;
import org.openchs.dao.EncounterRepository;
import org.openchs.dao.IndividualRepository;
import org.openchs.dao.application.FormMappingRepository;
import org.openchs.domain.Encounter;
import org.openchs.domain.EntityApprovalStatus;
import org.openchs.domain.Individual;
import org.openchs.importer.batch.csv.creator.BasicEncounterCreator;
import org.openchs.importer.batch.csv.writer.header.EncounterHeaders;
import org.openchs.importer.batch.model.Row;
import org.openchs.service.EntityApprovalStatusService;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;


@Component
public class EncounterWriter implements ItemWriter<Row>, Serializable {

    private EncounterRepository encounterRepository;
    private IndividualRepository individualRepository;
    private static EncounterHeaders headers = new EncounterHeaders();
    private BasicEncounterCreator basicEncounterCreator;
    private EntityApprovalStatusService entityApprovalStatusService;
    private FormMappingRepository formMappingRepository;


    @Autowired
    public EncounterWriter(EncounterRepository encounterRepository,
                           IndividualRepository individualRepository,
                           BasicEncounterCreator basicEncounterCreator,
                           EntityApprovalStatusService entityApprovalStatusService,
                           FormMappingRepository formMappingRepository) {
        this.encounterRepository = encounterRepository;
        this.individualRepository = individualRepository;
        this.basicEncounterCreator = basicEncounterCreator;
        this.entityApprovalStatusService = entityApprovalStatusService;
        this.formMappingRepository = formMappingRepository;
    }

    @Override
    public void write(List<? extends Row> rows) throws Exception {
        for (Row row : rows) write(row);
    }

    private void write(Row row) throws Exception {
        Encounter encounter = getOrCreateEncounter(row);

        List<String> allErrorMsgs = new ArrayList<>();
        basicEncounterCreator.updateEncounter(row, encounter, allErrorMsgs, FormType.Encounter);

        encounter.setIndividual(getSubject(row, allErrorMsgs));

        if (allErrorMsgs.size() > 0) {
            throw new Exception(String.join(", ", allErrorMsgs));
        }

        encounter.setVoided(false);
        encounter.assignUUIDIfRequired();

        Encounter savedEncounter = encounterRepository.save(encounter);
        FormMapping formMapping = formMappingRepository.getRequiredFormMapping(savedEncounter.getIndividual().getSubjectType().getUuid(), null, savedEncounter.getEncounterType().getUuid(), FormType.Encounter);
        if (formMapping.isEnableApproval()) {
            entityApprovalStatusService.createDefaultStatus(EntityApprovalStatus.EntityType.Encounter, savedEncounter.getId());
        }
    }

    private Individual getSubject(Row row, List<String> errorMsgs) {
        String subjectExternalId = row.get(headers.subjectId);
        if (subjectExternalId == null || subjectExternalId.isEmpty()) {
            errorMsgs.add(String.format("'%s' is required", headers.subjectId));
            return null;
        }
        Individual individual = individualRepository.findByLegacyId(subjectExternalId);
        if (individual == null) {
            errorMsgs.add(String.format("'%s' not found in database", headers.subjectId));
            return null;
        }
        return individual;
    }

    private Encounter getOrCreateEncounter(Row row) {
        String legacyId = row.get(headers.id);
        Encounter existingEncounter = null;
        if (legacyId != null && !legacyId.isEmpty()) {
            existingEncounter = encounterRepository.findByLegacyId(legacyId);
        }
        return existingEncounter == null ? createNewEncounter(legacyId) : existingEncounter;
    }

    private Encounter createNewEncounter(String externalId) {
        Encounter encounter = new Encounter();
        encounter.setLegacyId(externalId);
        return encounter;
    }
}
