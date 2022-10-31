package org.avni.server.web.request.webapp.search;

import org.joda.time.DateTime;

import java.util.ArrayList;
import java.util.List;

public class SubjectSearchRequest {
    private String subjectType;
    private String name;
    private IntegerRange age;
    private Boolean includeVoided;
    private List<Integer> addressIds = new ArrayList<>();
    private List<Concept> concept;
    private List<String> gender;
    private DateRange registrationDate;
    private DateRange encounterDate;
    private DateRange programEncounterDate;
    private DateRange programEnrolmentDate;
    private String searchAll;
    private PageDetails pageElement;
    private List<String> programs;
    private String userGroup;
    private String assignedTo;
    private DateTime createdOn;

    public String getSubjectType() {
        return subjectType;
    }

    public void setSubjectType(String subjectType) {
        this.subjectType = subjectType;
    }

    public String getName() {
        return trim(name);
    }

    public void setName(String name) {
        this.name = name;
    }

    public IntegerRange getAge() {
        return age;
    }

    public void setAge(IntegerRange age) {
        this.age = age;
    }

    public Boolean getIncludeVoided() {
        return includeVoided;
    }

    public void setIncludeVoided(Boolean includeVoided) {
        this.includeVoided = includeVoided;
    }

    public List<Integer> getAddressIds() {
        return addressIds;
    }

    public void setAddressIds(List<Integer> addressIds) {
        this.addressIds = addressIds;
    }

    public List<Concept> getConcept() {
        return concept;
    }

    public void setConcept(List<Concept> concept) {
        this.concept = concept;
    }

    public List<String> getGender() {
        return gender;
    }

    public void setGender(List<String> gender) {
        this.gender = gender;
    }

    public DateRange getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(DateRange registrationDate) {
        this.registrationDate = registrationDate;
    }

    public DateRange getEncounterDate() {
        return encounterDate;
    }

    public void setEncounterDate(DateRange encounterDate) {
        this.encounterDate = encounterDate;
    }

    public DateRange getProgramEncounterDate() {
        return programEncounterDate;
    }

    public void setProgramEncounterDate(DateRange programEncounterDate) {
        this.programEncounterDate = programEncounterDate;
    }

    public DateRange getProgramEnrolmentDate() {
        return programEnrolmentDate;
    }

    public void setProgramEnrolmentDate(DateRange programEnrolmentDate) {
        this.programEnrolmentDate = programEnrolmentDate;
    }

    public String getSearchAll() {
        return trim(searchAll);
    }

    public void setSearchAll(String searchAll) {
        this.searchAll = searchAll;
    }

    public PageDetails getPageElement() {
        return pageElement;
    }

    public void setPageElement(PageDetails pageElement) {
        this.pageElement = pageElement;
    }

    private String trim(String item) {
        if (item == null) return item;
        return item.trim();
    }

    public List<String> getPrograms() {
        return programs;
    }

    public void setPrograms(List<String> programs) {
        this.programs = programs;
    }

    public String getUserGroup() {
        return userGroup;
    }

    public void setUserGroup(String userGroup) {
        this.userGroup = userGroup;
    }

    public String getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(String assignedTo) {
        this.assignedTo = assignedTo;
    }

    public DateTime getCreatedOn() {
        return createdOn;
    }

    public void setCreatedOn(DateTime createdOn) {
        this.createdOn = createdOn;
    }
}
