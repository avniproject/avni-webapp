package org.avni.server.adapter.contract;

import jdk.nashorn.api.scripting.ScriptObjectMirror;
import org.joda.time.DateTime;
import org.avni.server.web.request.ProgramEncounterRequest;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class ProgramScheduledVisitsResponse extends RuleResponse {
    private List<ProgramScheduledVisitRuleResponse> programScheduledVisitRuleResponseList = new ArrayList<>();

    public ProgramScheduledVisitsResponse(ScriptObjectMirror scriptObjectMirror) {
        super(scriptObjectMirror);
        addToList(scriptObjectMirror, this.programScheduledVisitRuleResponseList, object -> new ProgramScheduledVisitRuleResponse((ScriptObjectMirror) object));
    }

    public List<ProgramEncounterRequest> getProgramEncounterRequests(String enrolmentUUID) {
        ArrayList<ProgramEncounterRequest> programEncounterRequests = new ArrayList<>();
        this.programScheduledVisitRuleResponseList.stream().forEach(programScheduledVisitRuleResponse -> {
            programEncounterRequests.add(programScheduledVisitRuleResponse.getProgramEncounterRequest(enrolmentUUID));
        });
        return programEncounterRequests;
    }

    public class ProgramScheduledVisitRuleResponse extends RuleResponse {
        private final String name;
        private final String encounterType;
        private final Date earliestDate;
        private final Date maxDate;

        public ProgramScheduledVisitRuleResponse(ScriptObjectMirror scriptObjectMirror) {
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
