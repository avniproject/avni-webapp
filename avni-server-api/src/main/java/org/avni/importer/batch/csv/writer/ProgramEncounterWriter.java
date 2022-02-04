package org.avni.importer.batch.csv.writer;

import org.avni.application.FormMapping;
import org.avni.application.FormType;
import org.avni.dao.ProgramEncounterRepository;
import org.avni.dao.application.FormMappingRepository;
import org.avni.domain.EntityApprovalStatus;
import org.avni.domain.ProgramEncounter;
import org.avni.domain.ProgramEnrolment;
import org.avni.importer.batch.csv.creator.BasicEncounterCreator;
import org.avni.importer.batch.csv.creator.ProgramEnrolmentCreator;
import org.avni.importer.batch.csv.writer.header.ProgramEncounterHeaders;
import org.avni.importer.batch.model.Row;
import org.avni.service.EntityApprovalStatusService;
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
        String id = row.get(headers.id);
        ProgramEncounter existingEncounter = null;
        if (id != null && !id.isEmpty()) {
            existingEncounter = programEncounterRepository.findByLegacyIdOrUuid(id);
        }
        return existingEncounter == null ? createNewEncounter(id) : existingEncounter;
    }

    private ProgramEncounter createNewEncounter(String externalId) {
        ProgramEncounter programEncounter = new ProgramEncounter();
        programEncounter.setLegacyId(externalId);
        programEncounter.setVoided(false);
        programEncounter.assignUUIDIfRequired();
        return programEncounter;
    }
}
