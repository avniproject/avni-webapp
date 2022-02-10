package org.avni.web.request.webapp;

import org.avni.domain.DeclarativeRule;
import org.avni.domain.OperationalProgram;
import org.springframework.hateoas.core.Relation;

import org.joda.time.DateTime;


/**
 * This class represents a combined entity representing one to one mapping of Program and OperationalProgram.
 */
@Relation(collectionRelation = "program")
public class ProgramContractWeb {
    private String name;
    private String programSubjectLabel;
    private String colour;
    private Long id;
    private Long organisationId;
    private Long programOrganisationId;
    private boolean voided;
    private Boolean active;
    private String enrolmentSummaryRule;
    private String enrolmentEligibilityCheckRule;
    private String createdBy;
    private String lastModifiedBy;
    private DateTime createdDateTime;
    private DateTime lastModifiedDateTime;
    private String subjectTypeUuid;
    private String programEnrolmentFormUuid;
    private String programExitFormUuid;
    private String uuid;
    private DeclarativeRule enrolmentEligibilityCheckDeclarativeRule;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOrganisationId() {
        return organisationId;
    }

    public void setOrganisationId(Long organisationId) {
        this.organisationId = organisationId;
    }

    public String getColour() {
        return colour;
    }

    public void setColour(String colour) {
        this.colour = colour;
    }

    public void setUUID(String uuid){
        this.uuid = uuid;
    }

    public String getUUID(){
        return uuid;
    }

    public static ProgramContractWeb fromOperationalProgram(OperationalProgram operationalProgram) {
        ProgramContractWeb contract = new ProgramContractWeb();

        contract.setId(operationalProgram.getId());
        contract.setName(operationalProgram.getName());
        contract.setUUID(operationalProgram.getProgram().getUuid());
        contract.setColour(operationalProgram.getProgram().getColour());
        contract.setProgramSubjectLabel(operationalProgram.getProgramSubjectLabel());
        contract.setOrganisationId(operationalProgram.getOrganisationId());
        contract.setVoided(operationalProgram.isVoided());
        contract.setActive(operationalProgram.getProgram().getActive());
        contract.setProgramOrganisationId(operationalProgram.getProgram().getOrganisationId());
        contract.setEnrolmentSummaryRule(operationalProgram.getEnrolmentSummaryRule());
        contract.setEnrolmentEligibilityCheckRule(operationalProgram.getEnrolmentEligibilityCheckRule());
        contract.setCreatedBy(operationalProgram.getCreatedBy().getUsername());
        contract.setLastModifiedBy(operationalProgram.getLastModifiedBy().getUsername());
        contract.setCreatedDateTime(operationalProgram.getCreatedDateTime());
        contract.setModifiedDateTime(operationalProgram.getLastModifiedDateTime());
        contract.setEnrolmentEligibilityCheckDeclarativeRule(operationalProgram.getEnrolmentEligibilityCheckDeclarativeRule());
        return contract;
    }


    public boolean isVoided() {
        return voided;
    }

    public void setVoided(boolean voided) {
        this.voided = voided;
    }

    public Long getProgramOrganisationId() {
        return programOrganisationId;
    }

    public void setProgramOrganisationId(Long programOrganisationId) {
        this.programOrganisationId = programOrganisationId;
    }

    public String getEnrolmentSummaryRule() {
        return enrolmentSummaryRule;
    }

    public void setEnrolmentSummaryRule(String enrolmentSummaryRule) {
        this.enrolmentSummaryRule = enrolmentSummaryRule;
    }

    public String getEnrolmentEligibilityCheckRule() {
        return enrolmentEligibilityCheckRule;
    }

    public void setEnrolmentEligibilityCheckRule(String enrolmentEligibilityCheckRule) {
        this.enrolmentEligibilityCheckRule = enrolmentEligibilityCheckRule;
    }

    public void setCreatedBy(String username){
        this.createdBy = username;
    }
    public String getCreatedBy(){
        return createdBy;
    }

    public void setLastModifiedBy(String username){
        this.lastModifiedBy = username;
    }

    public String getLastModifiedBy(){
        return lastModifiedBy;
    }


    public void setCreatedDateTime(DateTime createDateTime){
        this.createdDateTime = createDateTime;
    }

    public DateTime getCreatedDateTime(){
        return createdDateTime;
    }

    public void setModifiedDateTime(DateTime lastModifiedDateTime){
        this.lastModifiedDateTime = lastModifiedDateTime;
    }

    public DateTime getModifiedDateTime(){
        return lastModifiedDateTime;
    }

    public String getProgramEnrolmentFormUuid() {
        return programEnrolmentFormUuid;
    }

    public void setProgramEnrolmentFormUuid(String programEnrolmentFormUuid) {
        this.programEnrolmentFormUuid = programEnrolmentFormUuid;
    }

    public String getProgramExitFormUuid() {
        return programExitFormUuid;
    }

    public void setProgramExitFormUuid(String programExitFormUuid) {
        this.programExitFormUuid = programExitFormUuid;
    }

    public String getSubjectTypeUuid() {
        return subjectTypeUuid;
    }

    public void setSubjectTypeUuid(String subjectTypeUuid) {
        this.subjectTypeUuid = subjectTypeUuid;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public DeclarativeRule getEnrolmentEligibilityCheckDeclarativeRule() {
        return enrolmentEligibilityCheckDeclarativeRule;
    }

    public void setEnrolmentEligibilityCheckDeclarativeRule(DeclarativeRule enrolmentEligibilityCheckDeclarativeRule) {
        this.enrolmentEligibilityCheckDeclarativeRule = enrolmentEligibilityCheckDeclarativeRule;
    }
}
