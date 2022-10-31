package org.avni.server.web.request.application;

import org.avni.server.domain.ChecklistDetail;
import org.avni.server.web.request.ReferenceDataContract;

import java.util.ArrayList;
import java.util.List;

public class ChecklistDetailRequest extends ReferenceDataContract {
    private List<ChecklistItemDetailRequest> items;

    static public ChecklistDetailRequest fromEntity(ChecklistDetail checklistDetail) {
        ChecklistDetailRequest request = new ChecklistDetailRequest();
        request.setName(checklistDetail.getName());
        request.setUuid(checklistDetail.getUuid());
        List<ChecklistItemDetailRequest> checklistItemDetailRequests = new ArrayList<>();
        checklistDetail.getItems().forEach(item -> {
            ChecklistItemDetailRequest checklistItemDetailRequest = ChecklistItemDetailRequest.fromEntity(item);
            checklistItemDetailRequests.add(checklistItemDetailRequest);
        });
        request.setItems(checklistItemDetailRequests);
        return request;
    }

    public List<ChecklistItemDetailRequest> getItems() {
        return items;
    }

    public void setItems(List<ChecklistItemDetailRequest> items) {
        this.items = items;
    }
}
