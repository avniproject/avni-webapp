package org.avni.server.adapter.contract.checklist;

import jdk.nashorn.api.scripting.ScriptObjectMirror;
import org.avni.server.dao.ConceptRepository;
import org.joda.time.DateTime;
import org.avni.server.adapter.contract.RuleResponse;
import org.avni.server.service.ChecklistService;
import org.avni.server.web.request.ChecklistRequest;
import org.avni.server.web.request.application.ChecklistItemRequest;

import java.util.ArrayList;
import java.util.List;

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
