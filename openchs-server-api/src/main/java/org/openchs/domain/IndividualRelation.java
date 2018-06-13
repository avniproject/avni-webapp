package org.openchs.domain;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "individual_relation")
public class IndividualRelation extends CHSEntity {
    @NotNull
    private String name;

    private boolean isVoided = false;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
    
    public static IndividualRelation create(String name) {
        IndividualRelation relation = new IndividualRelation();
        relation.name = name;
        return relation;
    }

    public boolean isVoided() {
        return isVoided;
    }

    public void setVoided(boolean voided) {
        isVoided = voided;
    }
}