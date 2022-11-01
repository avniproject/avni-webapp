package org.avni.server.web.request.application;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.avni.server.application.FormElementGroup;
import org.avni.server.domain.DeclarativeRule;
import org.avni.server.web.request.ReferenceDataContract;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class FormElementGroupContract extends ReferenceDataContract {
    private Double displayOrder;
    private String display;
    private List<FormElementContract> formElements = formElements = new ArrayList<>();
    private Long organisationId;
    private String rule;
    private DeclarativeRule declarativeRule;
    private Long startTime;
    private Long stayTime;
    @JsonInclude(JsonInclude.Include.NON_DEFAULT)
    private boolean isTimed = false;
    private String textColour;
    private String backgroundColour;

    public FormElementGroupContract() {
    }

    public FormElementGroupContract(String uuid, String name, Double displayOrder) {
        super(uuid, name);
        this.displayOrder = displayOrder;
    }

    public String getRule() {
        return rule;
    }

    public void setRule(String rule) {
        this.rule = rule;
    }

    public Double getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Double displayOrder) {
        this.displayOrder = displayOrder;
    }

    public List<FormElementContract> getFormElements() {
        return formElements;
    }

    public void setFormElements(List<FormElementContract> formElements) {
        this.formElements = formElements;
    }

    public void addFormElement(FormElementContract formElementContract) {
        this.formElements.add(formElementContract);
    }

    public String getDisplay() {
        return display;
    }

    public void setDisplay(String display) {
        this.display = display;
    }

    public DeclarativeRule getDeclarativeRule() {
        return declarativeRule;
    }

    public void setDeclarativeRule(DeclarativeRule declarativeRule) {
        this.declarativeRule = declarativeRule;
    }

    public Long getStartTime() {
        return startTime;
    }

    public void setStartTime(Long startTime) {
        this.startTime = startTime;
    }

    public Long getStayTime() {
        return stayTime;
    }

    public void setStayTime(Long stayTime) {
        this.stayTime = stayTime;
    }

    public boolean isTimed() {
        return isTimed;
    }

    public void setTimed(boolean timed) {
        isTimed = timed;
    }

    public String getTextColour() {
        return textColour;
    }

    public void setTextColour(String textColour) {
        this.textColour = textColour;
    }

    public String getBackgroundColour() {
        return backgroundColour;
    }

    public void setBackgroundColour(String backgroundColour) {
        this.backgroundColour = backgroundColour;
    }

    @Override
    public String toString() {
        return "{" +
                "name=" + this.getName() + '\'' +
                "displayOrder=" + displayOrder +
                ", display='" + display + '\'' +
                '}';
    }

    public void setOrganisationId(Long organisationId) {
        this.organisationId = organisationId;
    }

    public Long getOrganisationId() {
        return organisationId;
    }

    public static FormElementGroupContract fromFormElementGroup(FormElementGroup feg) {
        FormElementGroupContract fegContract = new FormElementGroupContract();
        fegContract.setName(feg.getName());
        fegContract.setUuid(feg.getUuid());
        fegContract.setDisplay(feg.getDisplay());
        fegContract.setDisplayOrder(feg.getDisplayOrder());
        fegContract.setVoided(feg.isVoided());
        fegContract.setRule(feg.getRule());
        fegContract.setDeclarativeRule(feg.getDeclarativeRule());
        fegContract.setTimed(feg.isTimed());
        fegContract.setStartTime(feg.getStartTime());
        fegContract.setStayTime(feg.getStayTime());
        fegContract.setTextColour(feg.getTextColour());
        fegContract.setBackgroundColour(feg.getBackgroundColour());
        List<FormElementContract> feContracts = feg.getFormElements().stream()
                .map(FormElementContract::fromFormElement)
                .sorted(Comparator.comparingDouble(FormElementContract::getDisplayOrder))
                .collect(Collectors.toList());
        fegContract.setFormElements(feContracts);
        return fegContract;
    }

    @Override
    @JsonInclude(JsonInclude.Include.NON_DEFAULT)
    public boolean isVoided() {
        return super.isVoided();
    }
}
