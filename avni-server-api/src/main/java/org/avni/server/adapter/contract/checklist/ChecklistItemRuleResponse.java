package org.avni.server.adapter.contract.checklist;

import jdk.nashorn.api.scripting.ScriptObjectMirror;
import org.avni.server.dao.ConceptRepository;
import org.avni.server.domain.ChecklistItem;
import org.avni.server.domain.Concept;
import org.avni.server.adapter.contract.RuleResponse;
import org.avni.server.service.ChecklistService;
import org.avni.server.web.request.application.ChecklistItemRequest;

import java.util.UUID;

public class ChecklistItemRuleResponse extends RuleResponse {
    private final String name;

    public ChecklistItemRuleResponse(ScriptObjectMirror scriptObjectMirror) {
        super(scriptObjectMirror);
        this.name = getString("name");

    }

    public ChecklistItemRequest getChecklistItemRequest(ChecklistService checklistService, String programEnrolmentUUID, ConceptRepository conceptRepository) {
        ChecklistItem checklistItem = checklistService.findChecklistItem(programEnrolmentUUID, name);

        ChecklistItemRequest checklistItemRequest = new ChecklistItemRequest();
        Concept concept = conceptRepository.findByName(name);
        if (concept == null)
            throw new RuntimeException(String.format("Couldn't find concept with name=%s in checklist being created from the rule", name));
        checklistItemRequest.setUuid(checklistItem == null ? UUID.randomUUID().toString() : checklistItem.getUuid());
        return checklistItemRequest;
    }
}
