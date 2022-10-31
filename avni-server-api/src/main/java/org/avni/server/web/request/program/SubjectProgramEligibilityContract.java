package org.avni.server.web.request.program;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.avni.server.web.request.CHSRequest;
import org.avni.server.web.request.ObservationRequest;
import org.joda.time.DateTime;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class SubjectProgramEligibilityContract extends CHSRequest {
    private String subjectUUID;
    private String programUUID;
    private boolean isEligible;
    private DateTime checkDate;
    private List<ObservationRequest> observations;

    public String getSubjectUUID() {
        return subjectUUID;
    }

    public void setSubjectUUID(String subjectUUID) {
        this.subjectUUID = subjectUUID;
    }

    public String getProgramUUID() {
        return programUUID;
    }

    public void setProgramUUID(String programUUID) {
        this.programUUID = programUUID;
    }

    public boolean isEligible() {
        return isEligible;
    }

    public void setEligible(boolean eligible) {
        isEligible = eligible;
    }

    public DateTime getCheckDate() {
        return checkDate;
    }

    public void setCheckDate(DateTime checkDate) {
        this.checkDate = checkDate;
    }

    public List<ObservationRequest> getObservations() {
        return observations;
    }

    public void setObservations(List<ObservationRequest> observations) {
        this.observations = observations;
    }
}
