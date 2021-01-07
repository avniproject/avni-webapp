package org.openchs.domain;


import org.hibernate.annotations.BatchSize;

import javax.persistence.Entity;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "card")
@BatchSize(size = 100)
public class Card extends OrganisationAwareEntity {

    @NotNull
    private String name;

    @NotNull
    private String query;

    private String description;

    private String colour;


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getColour() {
        return colour;
    }

    public void setColour(String colour) {
        this.colour = colour;
    }
}
