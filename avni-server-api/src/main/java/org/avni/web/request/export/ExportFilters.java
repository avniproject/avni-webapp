package org.avni.web.request.export;

import org.joda.time.DateTime;

import java.util.List;

public class ExportFilters {
    private List<Long> addressLevelIds;
    private DateFilter date;

    public List<Long> getAddressLevelIds() {
        return addressLevelIds;
    }

    public void setAddressLevelIds(List<Long> addressLevelIds) {
        this.addressLevelIds = addressLevelIds;
    }

    public DateFilter getDate() {
        return date;
    }

    public void setDate(DateFilter date) {
        this.date = date;
    }

    private class DateFilter {
        private DateTime to;
        private DateTime from;

        public DateTime getTo() {
            return to;
        }

        public void setTo(DateTime to) {
            this.to = to;
        }

        public DateTime getFrom() {
            return from;
        }

        public void setFrom(DateTime from) {
            this.from = from;
        }
    }
}
