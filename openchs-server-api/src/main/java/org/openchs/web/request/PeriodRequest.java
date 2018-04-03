package org.openchs.web.request;

import org.openchs.web.validation.ValidationException;

import java.util.regex.Pattern;
import java.util.regex.Matcher;

public class PeriodRequest {
    private int value;
    private IntervalUnit unit;

    private static Pattern yearPattern = Pattern.compile("([Yy](ears|ear|rs|r))");
    private static Pattern monthPattern = Pattern.compile("([Mm](onths|onth|ons|on|nths|nth|ths|th))");

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

    public static PeriodRequest fromString(String str) throws ValidationException {
        String[] parts = str.split(" ");
        int value;

        try {
            value = Integer.parseInt(parts[0]);
        } catch (NumberFormatException e) {
            throw new ValidationException("Bad input. Received: " +str);
        }

        if (value < 1) throw new ValidationException("Bad input. Received: " +str);
        if (yearPattern.matcher(parts[1]).find()) return new PeriodRequest(value, IntervalUnit.YEARS);
        if (monthPattern.matcher(parts[1]).find() && value <=12) return new PeriodRequest(value, IntervalUnit.MONTHS);

        throw new ValidationException("Bad input. Received: " +str);
    }
}
