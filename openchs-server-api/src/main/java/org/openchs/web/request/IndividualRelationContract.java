package org.openchs.web.request;

import java.util.List;

public class IndividualRelationContract {
    private Long id;
    private String name;
    private String uuid;
    private List<GenderContract> genders;

    public IndividualRelationContract(Long id, String name, String uuid, List<GenderContract> genders) {
        this.id = id;
        this.name = name;
        this.uuid = uuid;
        this.genders = genders;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getUuid() {
        return uuid;
    }

    public List<GenderContract> getGenders() {
        return genders;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    public void setGenders(List<GenderContract> genders) {
        this.genders = genders;
    }
}
