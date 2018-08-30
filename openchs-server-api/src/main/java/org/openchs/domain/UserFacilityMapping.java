package org.openchs.domain;

import javax.persistence.*;

@Entity
@Table(name = "user_facility_mapping")
public class UserFacilityMapping extends OrganisationAwareEntity {
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "facility_id")
    private Facility facility;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    public Facility getFacility() {
        return facility;
    }

    public void setFacility(Facility facility) {
        this.facility = facility;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
