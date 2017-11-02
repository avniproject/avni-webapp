package org.openchs.domain;

import javax.persistence.*;

@Entity
@Table(name = "organisation")
public class Organisation extends CHSEntity{

    @Column
    private String name;

    @Column
    private String dbUser;

    public Organisation() {
    }

    public Organisation(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDbUser() {
        return dbUser;
    }

    public void setDbUser(String dbUser) {
        this.dbUser = dbUser;
    }
}
