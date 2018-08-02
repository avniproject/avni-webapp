package org.openchs.web.request.application;

import org.openchs.web.request.CHSRequest;
import org.openchs.web.request.ConceptContract;

import java.util.List;

public class ChecklistItemDetailRequest extends CHSRequest {
    private ConceptContract concept;
    private List<ChecklistItemStatusRequest> status;
    private String formUUID;

    public ConceptContract getConcept() {
        return concept;
    }

    public void setConcept(ConceptContract concept) {
        this.concept = concept;
    }

    public List<ChecklistItemStatusRequest> getStatus() {
        return status;
    }

    public void setStatus(List<ChecklistItemStatusRequest> status) {
        this.status = status;
    }

    public String getFormUUID() {
        return formUUID;
    }

    public void setFormUUID(String formUUID) {
        this.formUUID = formUUID;
    }
}
