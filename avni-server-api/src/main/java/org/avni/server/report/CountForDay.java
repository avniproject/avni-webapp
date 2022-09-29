package org.avni.server.report;

import java.util.Date;

public class CountForDay {
    private Date day;
    private long value;

    public Date getDay() {
        return day;
    }

    public void setDay(Date day) {
        this.day = day;
    }

    public long getValue() {
        return value;
    }

    public void setValue(long value) {
        this.value = value;
    }
}
