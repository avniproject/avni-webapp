package org.avni.server.adapter.contract.enrolment;

import org.avni.server.dao.ConceptRepository;
import org.avni.server.dao.IndividualRepository;
import org.avni.server.domain.Individual;
import org.avni.server.adapter.ObservationsHelper;
import org.avni.server.adapter.contract.IndividualRuleInput;
import org.avni.server.adapter.contract.ProgramRuleInput;
import org.avni.server.web.request.ProgramEnrolmentRequest;

import java.util.Date;

public class ProgramEnrolmentRuleInput {
    private ProgramEnrolmentRequest programEnrolmentRequest;
    private ConceptRepository conceptRepository;
    private IndividualRuleInput individual;
    private ProgramRuleInput program;

    public ProgramEnrolmentRuleInput(ProgramEnrolmentRequest programEnrolmentRequest, IndividualRepository individualRepository, ConceptRepository conceptRepository) {
        this.programEnrolmentRequest = programEnrolmentRequest;
        this.conceptRepository = conceptRepository;
        Individual individual = individualRepository.findByUuid(programEnrolmentRequest.getIndividualUUID());
        this.individual = new IndividualRuleInput(individual, programEnrolmentRequest.getEnrolmentDateTime().toLocalDate());
        this.program = new ProgramRuleInput(programEnrolmentRequest.getProgram());
    }

    public IndividualRuleInput getIndividual() {
        return individual;
    }

    public void setIndividual(IndividualRuleInput individual) {
        this.individual = individual;
    }

    public ProgramRuleInput getProgram() {
        return program;
    }

    public void setProgram(ProgramRuleInput program) {
        this.program = program;
    }

    // In data migration this will never be called in edit mode, so it can assume that there are no encounters
    public Object getObservationReadableValueInEntireEnrolment(String conceptName, Object programEncounter) {
        return this.getObservationValue(conceptName);
    }

    public Date getEnrolmentDateTime() {
        return this.programEnrolmentRequest.getEnrolmentDateTime().toDate();
    }

    public Object findEncounter(String encounterTypeName, String encounterName) {
        return null;
    }

    public boolean hasEncounter(String encounterTypeName, String encounterName) {
        return false;
    }

    public Object[] getEncounters(Object... objects) {
        return new Object[]{};
    }
    // end

    public Object getObservationValue(String conceptName) {
        return ObservationsHelper.getObservationValue(conceptName, programEnrolmentRequest.getObservations(), conceptRepository);
    }

    public Object findObservation(String conceptName) {
        return ObservationsHelper.getObservation(conceptName, programEnrolmentRequest.getObservations(), conceptRepository);
    }

    public ProgramEnrolmentRequest getProgramEnrolmentRequest() {
        return programEnrolmentRequest;
    }
}
