package org.openchs.web.request.rules.RulesContractWrapper;

import org.joda.time.DateTime;
import org.openchs.web.request.CHSRequest;

import java.util.List;

public class ChecklistContract {

    private DateTime baseDate;
    private CHSRequest detail;
    private List<ChecklistDetailContract> items;

    public DateTime getBaseDate() {
        return baseDate;
    }

    public void setBaseDate(DateTime baseDate) {
        this.baseDate = baseDate;
    }

    public CHSRequest getDetail() {
        return detail;
    }

    public void setDetail(CHSRequest detail) {
        this.detail = detail;
    }

    public List<ChecklistDetailContract> getItems() {
        return items;
    }

    public void setItems(List<ChecklistDetailContract> items) {
        this.items = items;
    }
}
