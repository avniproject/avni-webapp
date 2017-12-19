package org.openchs.healthmodule.adapter.contract.enrolment;

import jdk.nashorn.api.scripting.ScriptObjectMirror;
import org.joda.time.DateTime;
import org.openchs.healthmodule.adapter.contract.RuleResponse;
import org.openchs.web.request.ProgramEncounterRequest;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class ProgramEnrolmentNextScheduledVisitsResponse extends RuleResponse {
    private List<ProgramEnrolmentScheduledVisitRuleResponse> programEnrolmentScheduledVisitRuleResponseList = new ArrayList<>();

    public ProgramEnrolmentNextScheduledVisitsResponse(ScriptObjectMirror scriptObjectMirror) {
        super(scriptObjectMirror);
        addToList(scriptObjectMirror, this.programEnrolmentScheduledVisitRuleResponseList, object -> new ProgramEnrolmentScheduledVisitRuleResponse((ScriptObjectMirror) object));
    }

    public List<ProgramEncounterRequest> getProgramEncounterRequests(String enrolmentUUID) {
        ArrayList<ProgramEncounterRequest> programEncounterRequests = new ArrayList<>();
        this.programEnrolmentScheduledVisitRuleResponseList.stream().forEach(programEnrolmentScheduledVisitRuleResponse -> {
            programEncounterRequests.add(programEnrolmentScheduledVisitRuleResponse.getProgramEncounterRequest(enrolmentUUID));
        });
        return programEncounterRequests;
    }

    public class ProgramEnrolmentScheduledVisitRuleResponse extends RuleResponse {
        private final String name;
        private final String encounterType;
        private final Date earliestDate;
        private final Date maxDate;

        public ProgramEnrolmentScheduledVisitRuleResponse(ScriptObjectMirror scriptObjectMirror) {
            super(scriptObjectMirror);
            this.name = (String) scriptObjectMirror.get("name");
            this.encounterType = (String) scriptObjectMirror.get("encounterType");
            this.earliestDate = this.getDate("earliestDate");
            this.maxDate = this.getDate("maxDate");
        }

        public ProgramEncounterRequest getProgramEncounterRequest(String enrolmentUUID) {
            ProgramEncounterRequest programEncounterRequest = ProgramEncounterRequest.createSafeInstance();
            programEncounterRequest.setProgramEnrolmentUUID(enrolmentUUID);
            programEncounterRequest.setName(name);
            programEncounterRequest.setEncounterType(encounterType);
            programEncounterRequest.setEarliestVisitDateTime(new DateTime(earliestDate));
            programEncounterRequest.setMaxDateTime(new DateTime(maxDate));
            return programEncounterRequest;
        }
    }
}