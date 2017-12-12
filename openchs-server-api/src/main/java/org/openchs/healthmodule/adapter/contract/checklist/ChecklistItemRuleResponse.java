package org.openchs.healthmodule.adapter.contract.checklist;

import jdk.nashorn.api.scripting.ScriptObjectMirror;
import org.joda.time.DateTime;
import org.openchs.dao.ConceptRepository;
import org.openchs.domain.ChecklistItem;
import org.openchs.domain.Concept;
import org.openchs.healthmodule.adapter.contract.RuleResponse;
import org.openchs.service.ChecklistService;
import org.openchs.web.request.application.ChecklistItemRequest;

import java.util.Date;
import java.util.UUID;

public class ChecklistItemRuleResponse extends RuleResponse {
    private final DateTime dueDate;
    private final DateTime maxDate;
    private final String name;

    public ChecklistItemRuleResponse(ScriptObjectMirror scriptObjectMirror) {
        super(scriptObjectMirror);
        this.name = getString("name");
        this.dueDate = getDateTime("dueDate");
        this.maxDate = getDateTime("maxDate");
    }

    public ChecklistItemRequest getChecklistItemRequest(ChecklistService checklistService, String programEnrolmentUUID, ConceptRepository conceptRepository) {
        ChecklistItem checklistItem = checklistService.findChecklistItem(programEnrolmentUUID, name);

        ChecklistItemRequest checklistItemRequest = new ChecklistItemRequest();
        Concept concept = conceptRepository.findByName(name);
        if (concept == null)
            throw new RuntimeException(String.format("Couldn't find concept with name=%s in checklist being created from the rule", name));
        checklistItemRequest.setUuid(checklistItem == null ? UUID.randomUUID().toString() : checklistItem.getUuid());
        checklistItemRequest.setDueDate(dueDate);
        checklistItemRequest.setMaxDate(maxDate);
        checklistItemRequest.setConceptUUID(concept.getUuid());
        return checklistItemRequest;
    }
}