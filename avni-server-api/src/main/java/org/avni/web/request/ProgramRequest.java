package org.avni.web.request;

import org.avni.domain.Program;
import org.avni.web.contract.ProgramContract;

public class ProgramRequest extends ProgramContract {
    public static ProgramRequest fromProgram(Program program) {
        ProgramRequest programRequest = new ProgramRequest();
        programRequest.setUuid(program.getUuid());
        programRequest.setName(program.getName());
        programRequest.setColour(program.getColour());
        programRequest.setVoided(program.isVoided());
        program.setActive(program.getActive());
        programRequest.setEnrolmentEligibilityCheckRule(program.getEnrolmentEligibilityCheckRule());
        programRequest.setEnrolmentSummaryRule(program.getEnrolmentSummaryRule());
        programRequest.setEnrolmentEligibilityCheckDeclarativeRule(program.getEnrolmentEligibilityCheckDeclarativeRule());
        return programRequest;
    }
}
