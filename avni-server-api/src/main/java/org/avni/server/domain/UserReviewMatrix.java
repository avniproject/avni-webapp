package org.avni.server.domain;

import org.hibernate.annotations.Type;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "user_review_matrix")
public class UserReviewMatrix {

    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    @Id
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column
    private Long organisationId;

    @Column
    private Long reviewYear;

    @Column
    @Type(type = "observations")
    private ObservationCollection matrix;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Long getReviewYear() {
        return reviewYear;
    }

    public void setReviewYear(Long reviewYear) {
        this.reviewYear = reviewYear;
    }

    public ObservationCollection getMatrix() {
        return matrix;
    }

    public void setMatrix(ObservationCollection matrix) {
        this.matrix = matrix;
    }

    public Long getOrganisationId() {
        return organisationId;
    }

    public void setOrganisationId(Long organisationId) {
        this.organisationId = organisationId;
    }
}
