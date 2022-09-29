package org.avni.server.domain;

import org.avni.server.application.projections.BaseProjection;
import org.hibernate.annotations.BatchSize;
import org.springframework.data.rest.core.config.Projection;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "checklist_detail")
@BatchSize(size = 100)
public class ChecklistDetail extends OrganisationAwareEntity {
    @NotNull
    @Column(name = "name")
    private String name;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "checklistDetail")
    private List<ChecklistItemDetail> items = new ArrayList<>();

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<ChecklistItemDetail> getItems() {
        return items;
    }

    public void setItems(List<ChecklistItemDetail> items) {
        this.items = items;
    }

    public void addItem(ChecklistItemDetail checklistItem) {
        this.items.add(checklistItem);
    }

    @Projection(name = "ChecklistDetailProjection", types = {ChecklistDetail.class})
    public interface ChecklistDetailProjection extends BaseProjection {
        String getName();
    }
}
