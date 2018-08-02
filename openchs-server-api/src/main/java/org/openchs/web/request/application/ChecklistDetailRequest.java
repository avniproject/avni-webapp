package org.openchs.web.request.application;

import org.openchs.web.request.ReferenceDataContract;

import java.util.List;

public class ChecklistDetailRequest extends ReferenceDataContract {
    private List<ChecklistItemDetailRequest> items;

    public List<ChecklistItemDetailRequest> getItems() {
        return items;
    }

    public void setItems(List<ChecklistItemDetailRequest> items) {
        this.items = items;
    }
}
