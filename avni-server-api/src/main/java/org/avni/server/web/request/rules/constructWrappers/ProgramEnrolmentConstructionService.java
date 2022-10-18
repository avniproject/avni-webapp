package org.avni.server.web.request.rules.constructWrappers;

import org.avni.server.dao.ChecklistDetailRepository;
import org.avni.server.dao.GroupSubjectRepository;
import org.avni.server.dao.IndividualRepository;
import org.avni.server.domain.*;
import org.avni.server.service.EntityApprovalStatusService;
import org.avni.server.service.ObservationService;
import org.avni.server.web.request.rules.RulesContractWrapper.*;
import org.avni.server.web.request.rules.request.ProgramEnrolmentRequestEntity;
import org.avni.server.web.request.application.ChecklistDetailRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProgramEnrolmentConstructionService {
    private final ObservationConstructionService observationConstructionService;
    private final IndividualConstructionService individualConstructionService;
    private final IndividualRepository individualRepository;
    private final ObservationService observationService;
    private final ChecklistDetailRepository checklistDetailRepository;
    private final EntityApprovalStatusService entityApprovalStatusService;
    private final GroupSubjectRepository groupSubjectRepository;

    @Autowired
    public ProgramEnrolmentConstructionService(
            ObservationConstructionService observationConstructionService,
            IndividualConstructionService individualConstructionService, IndividualRepository individualRepository,
            ObservationService observationService,
            ChecklistDetailRepository checklistDetailRepository,
            EntityApprovalStatusService entityApprovalStatusService,
            GroupSubjectRepository groupSubjectRepository) {
        this.observationConstructionService = observationConstructionService;
        this.individualConstructionService = individualConstructionService;
        this.individualRepository = individualRepository;
        this.observationService = observationService;
        this.checklistDetailRepository = checklistDetailRepository;
        this.entityApprovalStatusService = entityApprovalStatusService;
        this.groupSubjectRepository = groupSubjectRepository;
    }


    public ProgramEnrolmentContract constructProgramEnrolmentContract(ProgramEnrolmentRequestEntity request) {
        ProgramEnrolmentContract programEnrolmentContract = new ProgramEnrolmentContract();
        programEnrolmentContract.setEnrolmentDateTime(request.getEnrolmentDateTime());
        programEnrolmentContract.setProgramExitDateTime(request.getProgramExitDateTime());
        programEnrolmentContract.setUuid(request.getUuid());
        programEnrolmentContract.setVoided(request.isVoided());
        if (request.getObservations() != null) {
            programEnrolmentContract.setObservations(request.getObservations().stream().map(x -> observationConstructionService.constructObservation(x)).collect(Collectors.toList()));
        }
        if (request.getProgramExitObservations() != null) {
            programEnrolmentContract.setExitObservations(request.getProgramExitObservations().stream().map(x -> observationConstructionService.constructObservation(x)).collect(Collectors.toList()));
        }
        if (request.getIndividualUUID() != null) {
            programEnrolmentContract.setSubject(individualConstructionService.getSubjectInfo(individualRepository.findByUuid(request.getIndividualUUID())));
        }
//        ProgramEnrolment programEnrolment = programEnrolmentRepository.findByUuid(request.getUuid());
//        Set<ProgramEncountersContract> encountersContractList = constructEncounters(programEnrolment.getProgramEncounters());
//        programEnrolmentContractWrapper.setProgramEncounters(encountersContractList);
        return programEnrolmentContract;
    }

    public ProgramEnrolmentContract constructProgramEnrolmentContract(ProgramEnrolment programEnrolment) {
        ProgramEnrolmentContract programEnrolmentContract = new ProgramEnrolmentContract();
        programEnrolmentContract.setEnrolmentDateTime(programEnrolment.getEnrolmentDateTime());
        programEnrolmentContract.setProgramExitDateTime(programEnrolment.getProgramExitDateTime());
        programEnrolmentContract.setUuid(programEnrolment.getUuid());
        programEnrolmentContract.setVoided(programEnrolment.isVoided());
        programEnrolmentContract.setObservations(observationService.constructObservationModelContracts(programEnrolment.getObservations()));
        programEnrolmentContract.setExitObservations(observationService.constructObservationModelContracts(programEnrolment.getProgramExitObservations()));
        if (programEnrolment.getIndividual() != null) {
            programEnrolmentContract.setSubject(individualConstructionService.getSubjectInfo(programEnrolment.getIndividual()));
        }
        return programEnrolmentContract;
    }

    public List<ChecklistDetailRequest> constructChecklistDetailRequest() {
        List<ChecklistDetail> checklistDetails = checklistDetailRepository.findAllByIsVoidedFalse();
        return checklistDetails
                .stream().map(ChecklistDetailRequest::fromEntity)
                .collect(Collectors.toList());
    }

}
