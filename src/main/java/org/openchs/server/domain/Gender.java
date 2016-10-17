package org.openchs.server.domain;

import javax.persistence.*;

@Entity
@Table(name = "gender")
public class Gender extends CHSEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="concept_id")
    private Concept concept;
}