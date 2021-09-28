package org.avni.service;

import org.avni.application.FormMapping;
import org.avni.application.FormType;
import org.avni.dao.IndividualRepository;
import org.avni.dao.OperationalProgramRepository;
import org.avni.dao.ProgramRepository;
import org.avni.dao.application.FormMappingRepository;
import org.avni.domain.Individual;
import org.avni.domain.OperationalProgram;
import org.avni.domain.Organisation;
import org.avni.domain.Program;
import org.avni.web.request.OperationalProgramContract;
import org.avni.web.request.ProgramRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.function.Predicate;
import java.util.stream.Collectors;

@Service
public class ProgramService {
    private final Logger logger;
    private ProgramRepository programRepository;
    private OperationalProgramRepository operationalProgramRepository;
    private final FormMappingRepository formMappingRepository;

    @Autowired
    public ProgramService(ProgramRepository programRepository, OperationalProgramRepository operationalProgramRepository, FormMappingRepository formMappingRepository) {
        this.programRepository = programRepository;
        this.operationalProgramRepository = operationalProgramRepository;
        this.formMappingRepository = formMappingRepository;
        logger = LoggerFactory.getLogger(this.getClass());
    }

    public void saveProgram(ProgramRequest programRequest) {
        logger.info(String.format("Creating program: %s", programRequest.toString()));
        Program program = programRepository.findByUuid(programRequest.getUuid());
        if (program == null) {
            program = createProgram(programRequest);
        }
        program.setName(programRequest.getName());
        program.setColour(programRequest.getColour());
        program.setEnrolmentSummaryRule(programRequest.getEnrolmentSummaryRule());
        program.setEnrolmentEligibilityCheckRule(programRequest.getEnrolmentEligibilityCheckRule());
        program.setActive(programRequest.getActive());
        programRepository.save(program);
    }


    public List<Program> getEligiblePrograms(Individual individual) {
        //get all program uuids using form mappings and form type
        List<FormMapping> formMappings = formMappingRepository
                .findBySubjectTypeAndFormFormTypeAndIsVoidedFalse(individual.getSubjectType(), FormType.ProgramEnrolment);
        List<Program> availablePrograms = formMappings.stream()
                .map(formMapping -> formMapping.getProgram())
                .collect(Collectors.toList());
        List<Program> activePrograms = individual.getActivePrograms();

        //If the subject is not enrolled in any program then return all available programs
        if (activePrograms.isEmpty()) return availablePrograms;

        //Remove programs that the subject is already enrolled in.
        List<Program> eligiblePrograms = formMappings.stream()
                .filter(formMapping -> !activePrograms.stream().anyMatch(program -> Objects.equals(formMapping.getProgramUuid(), program.getUuid())))
                .map(formMapping -> formMapping.getProgram())
                .collect(Collectors.toList());
        return eligiblePrograms;
    }

    public void createOperationalProgram(OperationalProgramContract operationalProgramContract, Organisation organisation) {
        String programUuid = operationalProgramContract.getProgram().getUuid();
        Program program = programRepository.findByUuid(programUuid);
        if (program == null) {
            logger.info(String.format("Program not found for uuid: '%s'", programUuid));
            return;
        }

        OperationalProgram operationalProgram = operationalProgramRepository.findByUuid(operationalProgramContract.getUuid());

        if (operationalProgram == null) { /* backward compatibility with old data created by old contract w/o uuid */
            operationalProgram = operationalProgramRepository.findByProgramAndOrganisationId(program, organisation.getId());
        }

        if (operationalProgram == null) {
            operationalProgram = new OperationalProgram();
        }

        operationalProgram.setUuid(operationalProgramContract.getUuid());
        operationalProgram.setName(operationalProgramContract.getName());
        operationalProgram.setProgram(program);
        operationalProgram.setOrganisationId(organisation.getId());
        operationalProgram.setVoided(operationalProgramContract.isVoided());
        operationalProgram.setProgramSubjectLabel(operationalProgramContract.getProgramSubjectLabel());
        operationalProgramRepository.save(operationalProgram);
    }

    private Program createProgram(ProgramRequest programRequest) {
        Program program = new Program();
        program.setUuid(programRequest.getUuid());
        return program;
    }
}
