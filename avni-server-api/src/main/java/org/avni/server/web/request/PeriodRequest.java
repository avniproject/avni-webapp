package org.avni.server.web.request;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.avni.server.web.validation.ValidationException;
import org.joda.time.LocalDate;

import java.util.regex.Pattern;
import java.util.regex.Matcher;

public class PeriodRequest {
    private int value;
    private IntervalUnit unit;

    private static Pattern numberPattern = Pattern.compile("([0-9]+)");
    private static Pattern alphabetPattern = Pattern.compile("([A-Za-z]+)");
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
        Matcher numMatcher = numberPattern.matcher(str);
        Matcher alphabetMatcher = alphabetPattern.matcher(str);
        int value = -1;
        try {
            if (numMatcher.find()) value = Integer.parseInt(numMatcher.group(1));
            if (value >= 1) {
                if (!alphabetMatcher.find()) return new PeriodRequest(value, IntervalUnit.YEARS); // default to Years if input is only a number
                if (yearPattern.matcher(str).find()) return new PeriodRequest(value, IntervalUnit.YEARS);
                if (monthPattern.matcher(str).find()) return new PeriodRequest(value, IntervalUnit.MONTHS);
            }
        } catch (Exception e) {
            throw new ValidationException("Bad input. Received: " + str);
        }

        throw new ValidationException("Bad input. Received: " + str);
    }
}
