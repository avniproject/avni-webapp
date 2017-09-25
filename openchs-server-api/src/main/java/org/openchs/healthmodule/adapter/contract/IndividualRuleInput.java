package org.openchs.healthmodule.adapter.contract;

import org.joda.time.DateTime;
import org.joda.time.LocalDate;

import java.util.Date;

public class IndividualRuleInput {
    private LocalDate dateOfBirth;
    private DateTime today;

    public IndividualRuleInput(LocalDate dateOfBirth, DateTime today) {
        this.dateOfBirth = dateOfBirth;
        this.today = today;
    }

    public Date getDateOfBirth() {
        return dateOfBirth.toDate();
    }

    public int getAgeInYears(Object o) {
        return today.getYear() - dateOfBirth.getYear();
    }
}