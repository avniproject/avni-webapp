package org.openchs.domain;

import javax.persistence.*;

@Entity
@Table(name = "users")
public class User extends CHSEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;
}