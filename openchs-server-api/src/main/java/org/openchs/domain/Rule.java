package org.openchs.domain;

import javax.persistence.Entity;

@Entity(name = "rule")
public class Rule extends OrganisationAwareEntity {

    private Program program;

    private String description;

    private RuleData data;

    private String code;
}
