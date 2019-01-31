package org.openchs.builder;

import org.openchs.application.Form;

import java.util.Map;

import org.openchs.dao.application.FormRepository;
import org.openchs.domain.ChecklistDetail;
import org.openchs.domain.ChecklistItemDetail;
import org.openchs.domain.Concept;
import org.openchs.framework.ApplicationContextProvider;
import org.openchs.service.ConceptService;
import org.openchs.web.request.application.ChecklistItemDetailRequest;

import java.util.HashMap;
import java.util.List;

public class ChecklistDetailBuilder extends BaseBuilder<ChecklistDetail, ChecklistDetailBuilder> {

    private final FormRepository formRepository;
    private final ConceptService conceptService;

    public ChecklistDetailBuilder(ChecklistDetail existingEntity) {
        super(existingEntity, new ChecklistDetail());
        conceptService = ApplicationContextProvider.getContext().getBean(ConceptService.class);
        formRepository = ApplicationContextProvider.getContext().getBean(FormRepository.class);
    }

    public ChecklistDetailBuilder withName(String name) {
        this.get().setName(name);
        return this;
    }

    private ChecklistItemDetail getExistingChecklistItemDetail(ChecklistDetail checklistDetail, ChecklistItemDetailRequest item) {
        return checklistDetail
                .getItems()
                .stream()
                .filter(cid -> cid.getUuid().equals(item.getUuid()))
                .findFirst()
                .orElse(null);
    }

    public ChecklistDetailBuilder withItems(List<ChecklistItemDetailRequest> items) {
        Map<String, ChecklistItemDetail> builtItems = new HashMap<>();
        items.forEach(item -> {
            Form form = formRepository.findByUuid(item.getFormUUID());
            Concept concept = conceptService.get(item.getConcept().getUuid());
            ChecklistItemDetail builtItemDetail = new ChecklistItemDetailBuilder(this.get(), getExistingChecklistItemDetail(this.get(), item))
                    .withUUID(item.getUuid())
                    .withChecklistItemStatus(item.getStatus())
                    .withVoided(item.isVoided())
                    .withform(form)
                    .withConcept(concept)
                    .withLeadItem(builtItems.get(item.getDependentOn()))
                    .withScheduleOnExpiryOfDependency(item.getScheduleOnExpiryOfDependency())
                    .withMinDaysFromStartDate(item.getMinDaysFromStartDate())
                    .build();
            builtItems.put(builtItemDetail.getUuid(), builtItemDetail);
        });
        return this;
    }

    public ChecklistDetailBuilder withVoided(Boolean voided) {
        this.get().setVoided(voided);
        return this;
    }
}
