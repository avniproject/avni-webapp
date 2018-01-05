package org.openchs.healthmodule.adapter.contract.checklist;

import jdk.nashorn.api.scripting.ScriptObjectMirror;
import org.joda.time.DateTime;
import org.openchs.dao.ConceptRepository;
import org.openchs.domain.Checklist;
import org.openchs.domain.ChecklistItem;
import org.openchs.domain.Concept;
import org.openchs.healthmodule.adapter.contract.RuleResponse;
import org.openchs.service.ChecklistService;
import org.openchs.web.request.ChecklistRequest;
import org.openchs.web.request.application.ChecklistItemRequest;

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
        checklistRequest.setName(name);
        return checklistRequest;
    }
}