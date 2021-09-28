package org.avni.healthmodule.adapter.contract.checklist;

import jdk.nashorn.api.scripting.ScriptObjectMirror;
import org.joda.time.DateTime;
import org.avni.dao.ConceptRepository;
import org.avni.domain.Checklist;
import org.avni.domain.ChecklistItem;
import org.avni.domain.Concept;
import org.avni.healthmodule.adapter.contract.RuleResponse;
import org.avni.service.ChecklistService;
import org.avni.web.request.ChecklistRequest;
import org.avni.web.request.application.ChecklistItemRequest;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class ChecklistRuleResponse extends RuleResponse {
    private String name;
    private DateTime baseDate;
    private List<ChecklistItemRuleResponse> items;

    public ChecklistRuleResponse(ScriptObjectMirror scriptObjectMirror) {
        super(scriptObjectMirror);
        name = getString("name");
        baseDate = getDateTime("baseDate");
        ScriptObjectMirror responseItems = (ScriptObjectMirror) scriptObjectMirror.get("items");
        this.items = new ArrayList<>();
        this.addToList(responseItems, items, object -> new ChecklistItemRuleResponse((ScriptObjectMirror) object));
    }

    public List<ChecklistItemRequest> getItems(ChecklistService checklistService, String programEnrolmentUUID, ConceptRepository conceptRepository) {
        ArrayList<ChecklistItemRequest> checklistItemRequests = new ArrayList<>();
        for (ChecklistItemRuleResponse checklistItemRuleResponse : items) {
            checklistItemRequests.add(checklistItemRuleResponse.getChecklistItemRequest(checklistService, programEnrolmentUUID, conceptRepository));
        }
        return checklistItemRequests;
    }

    public ChecklistRequest getChecklistRequest() {
        ChecklistRequest checklistRequest = new ChecklistRequest();
        checklistRequest.setBaseDate(baseDate);
        return checklistRequest;
    }
}
