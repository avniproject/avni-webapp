package org.openchs.domain;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "users")
public class User extends OrganisationAwareEntity {
    @Column
    @NotNull
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public static User newUser(String name, Long orgId) {
        User user = new User();
        user.setName(name);
        user.setOrganisationId(orgId);
        return user;
    }
}