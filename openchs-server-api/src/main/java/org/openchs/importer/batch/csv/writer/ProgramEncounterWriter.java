package org.openchs.importer.batch.csv.writer;

import org.openchs.application.FormMapping;
import org.openchs.application.FormType;
import org.openchs.dao.ProgramEncounterRepository;
import org.openchs.dao.application.FormMappingRepository;
import org.openchs.domain.EntityApprovalStatus;
import org.openchs.domain.ProgramEncounter;
import org.openchs.domain.ProgramEnrolment;
import org.openchs.importer.batch.csv.creator.BasicEncounterCreator;
import org.openchs.importer.batch.csv.creator.ProgramEnrolmentCreator;
import org.openchs.importer.batch.csv.writer.header.ProgramEncounterHeaders;
import org.openchs.importer.batch.model.Row;
import org.openchs.service.EntityApprovalStatusService;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;


@Component
public class ProgramEncounterWriter implements ItemWriter<Row>, Serializable {

    private final ProgramEncounterRepository programEncounterRepository;
    private static ProgramEncounterHeaders headers = new ProgramEncounterHeaders();
    private ProgramEnrolmentCreator programEnrolmentCreator;
    private BasicEncounterCreator basicEncounterCreator;
    private EntityApprovalStatusService entityApprovalStatusService;
    private FormMappingRepository formMappingRepository;


    @Autowired
    public ProgramEncounterWriter(ProgramEncounterRepository programEncounterRepository,
                                  ProgramEnrolmentCreator programEnrolmentCreator,
                                  BasicEncounterCreator basicEncounterCreator,
                                  EntityApprovalStatusService entityApprovalStatusService,
                                  FormMappingRepository formMappingRepository) {
        this.programEncounterRepository = programEncounterRepository;
        this.programEnrolmentCreator = programEnrolmentCreator;
        this.basicEncounterCreator = basicEncounterCreator;
        this.entityApprovalStatusService = entityApprovalStatusService;
        this.formMappingRepository = formMappingRepository;
    }

    @Override
    public void write(List<? extends Row> rows) throws Exception {
        for (Row row : rows) write(row);
    }

    private void write(Row row) throws Exception {
        ProgramEncounter programEncounter = getOrCreateProgramEncounter(row);
        List<String> allErrorMsgs = new ArrayList<>();
        basicEncounterCreator.updateEncounter(row, programEncounter, allErrorMsgs, FormType.ProgramEncounter);
        ProgramEnrolment programEnrolment = programEnrolmentCreator.getProgramEnrolment(row.get(headers.enrolmentId), allErrorMsgs, headers.enrolmentId);
        programEncounter.setProgramEnrolment(programEnrolment);

        if (allErrorMsgs.size() > 0) {
            throw new Exception(String.join(", ", allErrorMsgs));
        }

        ProgramEncounter savedEncounter = programEncounterRepository.save(programEncounter);
        FormMapping formMapping = formMappingRepository.getRequiredFormMapping(programEnrolment.getIndividual().getSubjectType().getUuid(), programEnrolment.getProgram().getUuid(), savedEncounter.getEncounterType().getUuid(), FormType.ProgramEncounter);
        if (formMapping.isEnableApproval()) {
            entityApprovalStatusService.createDefaultStatus(EntityApprovalStatus.EntityType.ProgramEncounter, savedEncounter.getId());
        }
    }

    private ProgramEncounter getOrCreateProgramEncounter(Row row) {
        String legacyId = row.get(headers.id);
        ProgramEncounter existingEncounter = null;
        if (legacyId != null && !legacyId.isEmpty()) {
            existingEncounter = programEncounterRepository.findByLegacyId(legacyId);
        }
        return existingEncounter == null ? createNewEncounter(legacyId) : existingEncounter;
    }

    private ProgramEncounter createNewEncounter(String externalId) {
        ProgramEncounter programEncounter = new ProgramEncounter();
        programEncounter.setLegacyId(externalId);
        programEncounter.setVoided(false);
        programEncounter.assignUUIDIfRequired();
        return programEncounter;
    }
}
