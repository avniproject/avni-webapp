package org.avni.server.web.request.webapp;

import org.avni.server.domain.OperationalProgram;
import org.avni.server.web.contract.ProgramContract;
import org.joda.time.DateTime;
import org.springframework.hateoas.core.Relation;


/**
 * This class represents a combined entity representing one to one mapping of Program and OperationalProgram.
 */
@Relation(collectionRelation = "program")
public class ProgramContractWeb extends ProgramContract {
    private String programSubjectLabel;
    private Long id;
    private Long organisationId;
    private Long programOrganisationId;
    private String createdBy;
    private String lastModifiedBy;
    private DateTime createdDateTime;
    private DateTime lastModifiedDateTime;
    private String subjectTypeUuid;
    private String programEnrolmentFormUuid;
    private String programExitFormUuid;
    private Long programId;

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

    public static ProgramContractWeb fromOperationalProgram(OperationalProgram operationalProgram) {
        ProgramContractWeb contract = new ProgramContractWeb();

        contract.setId(operationalProgram.getId());
        contract.setProgramId(operationalProgram.getProgram().getId());
        contract.setName(operationalProgram.getName());
        contract.setUuid(operationalProgram.getProgram().getUuid());
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
        contract.setManualEligibilityCheckRequired(operationalProgram.isManualEligibilityCheckRequired());
        contract.setManualEnrolmentEligibilityCheckRule(operationalProgram.getManualEnrolmentEligibilityCheckRule());
        contract.setManualEnrolmentEligibilityCheckDeclarativeRule(operationalProgram.getManualEnrolmentEligibilityCheckDeclarativeRule());
        return contract;
    }

    public Long getProgramOrganisationId() {
        return programOrganisationId;
    }

    public void setProgramOrganisationId(Long programOrganisationId) {
        this.programOrganisationId = programOrganisationId;
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

    public void setProgramId(Long programId) {
        this.programId = programId;
    }

    public Long getProgramId() {
        return programId;
    }
}
