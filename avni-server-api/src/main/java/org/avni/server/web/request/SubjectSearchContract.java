package org.avni.server.web.request;

import org.avni.server.domain.Individual;

public class SubjectSearchContract {

    private Long id;
    private String name;

    public static SubjectSearchContract fromSubject(Individual individual) {
        SubjectSearchContract contract = new SubjectSearchContract();
        StringBuilder fullName = new StringBuilder(individual.getFirstName());
        if (individual.getMiddleName() != null) {
            fullName.append(" ").append(individual.getMiddleName());
        }
        if (individual.getLastName() != null) {
            fullName.append(" ").append(individual.getLastName());
        }
        contract.setId(individual.getId());
        contract.setName(fullName.toString());
        return contract;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
