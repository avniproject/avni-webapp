package org.openchs.healthmodule.adapter.contract;

import jdk.nashorn.internal.objects.NativeDate;
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

    public int getAgeInYears(NativeDate date) {
        return this.getAgeInYears(new LocalDate((long)date.getTime(date)));
    }

    private int getAgeInYears(LocalDate localDate) {
        return localDate.getYear() - this.individual.getDateOfBirth().getYear();
    }

    public int getAgeInYears() {
        return this.getAgeInYears(this.today);
    }
}