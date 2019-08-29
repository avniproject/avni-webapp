package org.openchs.web.request.webapp;


public class UpdateProgram {
    private String name;
    private String colour;
    private String programSubjectLabel;
    private Long id;



    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public String getColour() {
        return colour;
    }

    public void setColour(String colour) {
        this.colour = colour;
    }

    public String getProgramSubjectLabel() {
        return programSubjectLabel;
    }

    public void setProgramSubjectLabel(String programSubjectLabel) {
        this.programSubjectLabel = programSubjectLabel;
    }


    public Long getId() {
        return id;
    }

    public void getId(Long id) {
        this.id = id;
    }


}
