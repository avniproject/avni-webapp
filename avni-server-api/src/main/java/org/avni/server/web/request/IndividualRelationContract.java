package org.avni.server.web.request;

import java.util.List;

public class IndividualRelationContract {
    private Long id;
    private String name;
    private String uuid;
    private boolean voided;

    private List<GenderContract> genders;

    public IndividualRelationContract() {}

    public IndividualRelationContract(Long id, String name, String uuid, boolean voided, List<GenderContract> genders) {
        this.id = id;
        this.name = name;
        this.uuid = uuid;
        this.voided = voided;
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

    public boolean isVoided() {
        return voided;
    }

    public void setVoided(boolean voided) {
        this.voided = voided;
    }
}
