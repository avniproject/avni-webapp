package org.avni.server.builder;

import org.avni.server.application.Form;

import java.util.Map;

import org.avni.server.dao.application.FormRepository;
import org.avni.server.domain.ChecklistDetail;
import org.avni.server.domain.ChecklistItemDetail;
import org.avni.server.domain.Concept;
import org.avni.server.framework.ApplicationContextProvider;
import org.avni.server.service.ConceptService;
import org.avni.server.web.request.application.ChecklistItemDetailRequest;

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
            Form form = getChecklistForm(item.getFormUUID());
            Concept concept = getConcept(item.getConcept().getUuid());
            ChecklistItemDetail builtItemDetail = new ChecklistItemDetailBuilder(this.get(), getExistingChecklistItemDetail(this.get(), item))
                    .withUUID(item.getUuid())
                    .withChecklistItemStatus(item.getStatus())
                    .withVoided(item.isVoided())
                    .withform(form)
                    .withConcept(concept)
                    .withLeadItem(builtItems.get(item.getDependentOn()))
                    .withScheduleOnExpiryOfDependency(item.getScheduleOnExpiryOfDependency())
                    .withMinDaysFromStartDate(item.getMinDaysFromStartDate())
                    .withMinDaysFromDependent(item.getMinDaysFromDependent())
                    .withExpiresAfter(item.getExpiresAfter())
                    .build();
            builtItems.put(builtItemDetail.getUuid(), builtItemDetail);
        });
        return this;
    }

    private Concept getConcept(String conceptUUID) {
        Concept concept = conceptService.get(conceptUUID);
        if (concept == null) {
            throw new IllegalArgumentException(String.format("No concept found for UUID %s", conceptUUID));
        }
        return concept;
    }

    private Form getChecklistForm(String formUUID) {
        Form form = formRepository.findByUuid(formUUID);
        if (form == null) {
            throw new IllegalArgumentException(String.format("No form found for UUID %s", formUUID));
        }
        return form;
    }

    public ChecklistDetailBuilder withVoided(Boolean voided) {
        this.get().setVoided(voided);
        return this;
    }
}
