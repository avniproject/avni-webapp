package org.openchs.web.request;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.joda.time.LocalDate;
import org.openchs.web.validation.ValidationException;

import java.util.regex.Pattern;
import java.util.regex.Matcher;

public class PeriodRequest {
    private int value;
    private IntervalUnit unit;

    private static Pattern yearPattern = Pattern.compile("([Yy](ear|r))");
    private static Pattern monthPattern = Pattern.compile("([Mm](on|nth|th))");

    public PeriodRequest(int value, IntervalUnit unit) {
        this.value = value;
        this.unit = unit;
    }

    public PeriodRequest() {
    }

    public int getValue() {
        return value;
    }

    public void setValue(int value) {
        this.value = value;
    }

    public IntervalUnit getUnit() {
        return unit;
    }

    public void setUnit(IntervalUnit unit) {
        this.unit = unit;
    }

    public LocalDate toDate(LocalDate referenceDate) {
        return IntervalUnit.YEARS.equals(unit) ? referenceDate.minusYears(value) : referenceDate.minusMonths(value);
    }

    @JsonIgnore
    public LocalDate calculateDateOfBirth(LocalDate toDate) {
        switch (getUnit()) {
            case YEARS:
                return toDate.minusYears(getValue());
            case MONTHS:
                return toDate.minusMonths(getValue());
            default:
                throw new ValidationException();

        }
    }

    public static PeriodRequest fromString(String str) {
        String[] parts = str.split(" ");
        int value;

        try {
            value = Integer.parseInt(parts[0]);
            if (parts.length == 1) return new PeriodRequest(value, IntervalUnit.YEARS);
            if (value >= 0) {
                if (yearPattern.matcher(parts[1]).find()) return new PeriodRequest(value, IntervalUnit.YEARS);
                if (monthPattern.matcher(parts[1]).find()) return new PeriodRequest(value, IntervalUnit.MONTHS);
            }
        } catch (Exception e) {
            throw new ValidationException("Bad input. Received: " + str);
        }

        throw new ValidationException("Bad input. Received: " + str);
    }
}
