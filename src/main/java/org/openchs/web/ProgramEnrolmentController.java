package org.openchs.web;

import org.openchs.dao.IndividualRepository;
import org.openchs.dao.ProgramEnrolmentRepository;
import org.openchs.dao.ProgramOutcomeRepository;
import org.openchs.dao.ProgramRepository;
import org.openchs.domain.Individual;
import org.openchs.domain.Program;
import org.openchs.domain.ProgramEnrolment;
import org.openchs.domain.ProgramOutcome;
import org.openchs.web.request.ProgramEnrolmentRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ProgramEnrolmentController extends AbstractController<ProgramEnrolment> {
    private final ProgramRepository programRepository;
    private final IndividualRepository individualRepository;
    private final ProgramOutcomeRepository programOutcomeRepository;
    private final ProgramEnrolmentRepository programEnrolmentRepository;

    @Autowired
    public ProgramEnrolmentController(ProgramRepository programRepository, IndividualRepository individualRepository, ProgramOutcomeRepository programOutcomeRepository, ProgramEnrolmentRepository programEnrolmentRepository) {
        this.programRepository = programRepository;
        this.individualRepository = individualRepository;
        this.programOutcomeRepository = programOutcomeRepository;
        this.programEnrolmentRepository = programEnrolmentRepository;
    }

    @RequestMapping(value = "/programEnrolments", method = RequestMethod.POST)
    void save(@RequestBody ProgramEnrolmentRequest request) {
        Program program = programRepository.findByUuid(request.getProgramUUID());
        ProgramOutcome programOutcome = programOutcomeRepository.findByUuid(request.getProgramOutcomeUUID());

        ProgramEnrolment programEnrolment = newOrExistingEntity(programEnrolmentRepository, request, new ProgramEnrolment());
        programEnrolment.setProgram(program);
        programEnrolment.setProgramOutcome(programOutcome);
        programEnrolment.setEnrolmentDateTime(request.getEnrolmentDateTime());
        programEnrolment.setProgramExitDateTime(request.getProgramExitDateTime());

        if (programEnrolment.isNew()) {
            Individual individual = individualRepository.findByUuid(request.getIndividualUUID());
            programEnrolment.setIndividual(individual);
            individual.addEnrolment(programEnrolment);
            individualRepository.save(individual);
        } else {
            programEnrolmentRepository.save(programEnrolment);
        }
    }
}