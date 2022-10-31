package org.avni.server.web.request;

import org.avni.server.domain.Program;
import org.avni.server.web.contract.ProgramContract;

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
        programRequest.setManualEligibilityCheckRequired(program.isManualEligibilityCheckRequired());
        programRequest.setManualEnrolmentEligibilityCheckRule(program.getManualEnrolmentEligibilityCheckRule());
        programRequest.setManualEnrolmentEligibilityCheckDeclarativeRule(program.getManualEnrolmentEligibilityCheckDeclarativeRule());
        return programRequest;
    }
}
