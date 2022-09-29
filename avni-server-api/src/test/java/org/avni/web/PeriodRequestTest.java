package org.avni.web;

import org.junit.Assert;
import org.avni.server.web.request.PeriodRequest;
import org.avni.server.web.request.IntervalUnit;
import org.junit.Test;
import org.avni.server.web.validation.ValidationException;


import static org.hamcrest.CoreMatchers.containsString;
import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.core.Is.is;


public class PeriodRequestTest {
    private String[] validYearStrings = {"Years", "years", "year", "yrs", "yr"};
    private String[] validMonthStrings = {"Months", "months", "month", "mons", "mon", "mnths", "mnth", "mths", "mth"};

    @Test
    public void testValidInputs() {
        for (String yearStr : validYearStrings) {
            PeriodRequest pr = PeriodRequest.fromString("22 " + yearStr);
            assertThat(pr.getValue(), is(equalTo(22)));
            assertThat(pr.getUnit(), is(equalTo(IntervalUnit.YEARS)));
        }

        for (String monthStr : validMonthStrings) {
            PeriodRequest pr = PeriodRequest.fromString("02 " + monthStr);
            assertThat(pr.getValue(), is(equalTo(2)));
            assertThat(pr.getUnit(), is(equalTo(IntervalUnit.MONTHS)));
        }
    }

    @Test
    public void testInputWithoutUnit() {
        PeriodRequest pr = PeriodRequest.fromString("22 ");
        assertThat(pr.getValue(), is(equalTo(22)));
        assertThat(pr.getUnit(), is(equalTo(IntervalUnit.YEARS)));
    }

    @Test
    public void testInvalidInputs() {
        String[] badInputs = {"22 days", "1 mts", "1 ms", "10 s", "10 hrs", "1m", "years"};

        for (String badInputStr : badInputs) {
            try {
                if (PeriodRequest.fromString(badInputStr) != null)
                    Assert.fail("Received valid input in testInvalidInputs: \"" + badInputStr + "\"");
            } catch (ValidationException ve) {
                System.out.println(ve.getMessage());
                assertThat(ve.getMessage(), containsString("Bad input"));
            }
        }
    }
}
