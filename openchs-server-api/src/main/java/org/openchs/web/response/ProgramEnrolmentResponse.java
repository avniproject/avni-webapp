package org.openchs.web.response;

import org.openchs.dao.ConceptRepository;
import org.openchs.domain.ProgramEnrolment;
import org.openchs.service.ConceptService;

import java.util.HashSet;
import java.util.LinkedHashMap;

public class ProgramEnrolmentResponse extends LinkedHashMap<String, Object> {
    public static ProgramEnrolmentResponse fromProgramEnrolment(ProgramEnrolment programEnrolment, ConceptRepository conceptRepository, ConceptService conceptService) {
        ProgramEnrolmentResponse programEnrolmentResponse = new ProgramEnrolmentResponse();
        programEnrolmentResponse.put("ID", programEnrolment.getUuid());
        programEnrolmentResponse.put("Voided", programEnrolment.isVoided());
        programEnrolmentResponse.put("Subject type", programEnrolment.getIndividual().getSubjectType().getName());
        programEnrolmentResponse.put("Subject ID", programEnrolment.getIndividual().getUuid());
        programEnrolmentResponse.put("Program", programEnrolment.getProgram().getName());
        programEnrolmentResponse.put("Enrolment datetime", programEnrolment.getEnrolmentDateTime());
        Response.putIfPresent(programEnrolmentResponse, "Enrolment location", programEnrolment.getEnrolmentLocation());

        programEnrolmentResponse.put("Exit datetime", programEnrolment.getProgramExitDateTime());
        Response.putIfPresent(programEnrolmentResponse, "Exit location", programEnrolment.getExitLocation());

        Response.putObservations(conceptRepository, conceptService, programEnrolmentResponse, new LinkedHashMap<>(), programEnrolment.getObservations());
        Response.putObservations(conceptRepository, conceptService, programEnrolmentResponse, new LinkedHashMap<>(), programEnrolment.getProgramExitObservations(), "exitObservations");

        Response.putChildren(programEnrolmentResponse, "encounters", new HashSet<>(programEnrolment.getProgramEncounters()));

        Response.putAudit(programEnrolment, programEnrolmentResponse);
        return programEnrolmentResponse;
    }
}