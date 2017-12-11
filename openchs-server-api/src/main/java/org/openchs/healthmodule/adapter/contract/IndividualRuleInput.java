package org.openchs.healthmodule.adapter.contract;

import org.joda.time.LocalDate;
import org.openchs.domain.Individual;

import java.util.Date;

public class IndividualRuleInput {
    private final Individual individual;
    private LocalDate today;

    public IndividualRuleInput(Individual individual, LocalDate today) {
        this.individual = individual;
        this.today = today;
    }

    public Date getDateOfBirth() {
        return individual.getDateOfBirth().toDate();
    }

    public int getAgeInYears(Object o) {
        return today.getYear() - this.individual.getDateOfBirth().getYear();
    }
}