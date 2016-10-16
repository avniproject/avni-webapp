package org.openchs.server.domain;

import javax.persistence.*;

@Entity
@Table(name = "genders")
public class Gender extends CHSEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;
}