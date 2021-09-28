package org.avni.web.response;

import org.avni.dao.ConceptRepository;
import org.avni.domain.ProgramEnrolment;
import org.avni.service.ConceptService;

import java.util.HashSet;
import java.util.LinkedHashMap;

import static org.avni.web.api.CommonFieldNames.*;
import static org.avni.web.api.ProgramEnrolmentFieldNames.*;

public class ProgramEnrolmentResponse extends LinkedHashMap<String, Object> {
    public static ProgramEnrolmentResponse fromProgramEnrolment(ProgramEnrolment programEnrolment, ConceptRepository conceptRepository, ConceptService conceptService) {
        ProgramEnrolmentResponse programEnrolmentResponse = new ProgramEnrolmentResponse();
        programEnrolmentResponse.put(ID, programEnrolment.getUuid());
        programEnrolmentResponse.put(VOIDED, programEnrolment.isVoided());
        programEnrolmentResponse.put(SUBJECT_TYPE, programEnrolment.getIndividual().getSubjectType().getName());
        programEnrolmentResponse.put(SUBJECT_ID, programEnrolment.getIndividual().getUuid());
        programEnrolmentResponse.put(PROGRAM, programEnrolment.getProgram().getName());
        programEnrolmentResponse.put(ENROLMENT_DATETIME, programEnrolment.getEnrolmentDateTime());
        Response.putIfPresent(programEnrolmentResponse, ENROLMENT_LOCATION, programEnrolment.getEnrolmentLocation());

        programEnrolmentResponse.put(EXIT_DATETIME, programEnrolment.getProgramExitDateTime());
        Response.putIfPresent(programEnrolmentResponse, EXIT_LOCATION, programEnrolment.getExitLocation());

        Response.putObservations(conceptRepository, conceptService, programEnrolmentResponse, new LinkedHashMap<>(), programEnrolment.getObservations());
        Response.putObservations(conceptRepository, conceptService, programEnrolmentResponse, new LinkedHashMap<>(), programEnrolment.getProgramExitObservations(), EXIT_OBS);

        Response.putChildren(programEnrolmentResponse, ENCOUNTERS, new HashSet<>(programEnrolment.getProgramEncounters()));

        Response.putAudit(programEnrolment, programEnrolmentResponse);
        return programEnrolmentResponse;
    }
}
