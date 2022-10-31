package org.avni.server.web.request.application;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.avni.server.web.request.ReferenceDataContract;

import java.util.ArrayList;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ConceptUsageContract {

    private List<FormUsageContract> forms = new ArrayList<>();
    private List<ReferenceDataContract> concepts = new ArrayList<>();

    public List<FormUsageContract> getForms() {
        return forms;
    }

    public void setForms(List<FormUsageContract> forms) {
        this.forms = forms;
    }

    public void addForms(FormUsageContract form) {
        this.forms.add(form);
    }


    public List<ReferenceDataContract> getConcepts() {
        return concepts;
    }

    public void setConcepts(List<ReferenceDataContract> concepts) {
        this.concepts = concepts;
    }

    public void addConcepts(ReferenceDataContract concept) {
        this.concepts.add(concept);
    }
}
