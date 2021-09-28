package org.avni.healthmodule.adapter.contract.checklist;

import jdk.nashorn.api.scripting.ScriptObjectMirror;
import org.joda.time.DateTime;
import org.avni.dao.ConceptRepository;
import org.avni.domain.ChecklistItem;
import org.avni.domain.Concept;
import org.avni.healthmodule.adapter.contract.RuleResponse;
import org.avni.service.ChecklistService;
import org.avni.web.request.application.ChecklistItemRequest;

import java.util.Date;
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
