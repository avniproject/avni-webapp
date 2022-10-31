package org.avni.server.domain;

import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.Type;
import org.avni.server.application.RuleType;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity(name = "rule")
@BatchSize(size = 100)
public class Rule extends OrganisationAwareEntity {

    @NotNull
    @Column(name="entity")
    @Type(type = "ruledEntity")
    private RuledEntity entity;

    @NotNull
    @Column(name = "type")
    @Enumerated(EnumType.STRING)
    private RuleType type;

    @NotNull
    @Column(name = "name")
    private String name;

    @NotNull
    @Column(name = "fn_name")
    private String fnName;

    @Column
    @Type(type = "ruleData")
    private RuleData data;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rule_dependency_id", nullable = true)
    private RuleDependency ruleDependency;

    @Column(name = "execution_order", nullable = false)
    private Double executionOrder;

    public RuledEntity getEntity() {
        return entity;
    }

    public void setEntity(RuledEntity entity) {
        this.entity = entity;
    }

    public RuleType getType() {
        return type;
    }

    public void setType(RuleType type) {
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public RuleData getData() {
        return data;
    }

    public void setData(RuleData data) {
        this.data = data;
    }

    public RuleDependency getRuleDependency() {
        return ruleDependency;
    }

    public void setRuleDependency(RuleDependency ruleDependency) {
        this.ruleDependency = ruleDependency;
    }

    public String getFnName() {
        return fnName;
    }

    public void setFnName(String fnName) {
        this.fnName = fnName;
    }

    public Double getExecutionOrder() {
        return executionOrder;
    }

    public void setExecutionOrder(Double executionOrder) {
        this.executionOrder = executionOrder;
    }
}
