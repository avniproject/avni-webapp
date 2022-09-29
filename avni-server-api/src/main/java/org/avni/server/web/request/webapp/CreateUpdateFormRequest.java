package org.avni.server.web.request.webapp;

import java.util.List;

public class CreateUpdateFormRequest {

    private String formType;
    private String name;
    private List<FormMappingRequest> formMappings;

    public String getFormType() {
        return formType;
    }

    public void setFormType(String formType) {
        this.formType = formType;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<FormMappingRequest> getFormMappings()
    {
      return formMappings;
    }

    public FormMappingRequest getFormMappingByIndex(int index){
        return formMappings.get(index);
    }

    public void setFormMappings(List<FormMappingRequest> formMapping){
      this.formMappings = formMapping;
    }
}
