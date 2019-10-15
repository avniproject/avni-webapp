package org.openchs.dao;

import org.openchs.domain.Organisation;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.CrudRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Repository;

@Repository
@PreAuthorize("hasAnyAuthority('user','admin','organisation_admin')")
public interface OrganisationRepository extends CrudRepository<Organisation, Long> {
    Organisation findByName(String name);

    Organisation findByUuid(String organisationUuid);

    @PreAuthorize("hasAnyAuthority('admin')")
    <S extends Organisation> S save(S entity);

    @PreAuthorize("hasAnyAuthority('admin')")
    @Procedure(value = "create_db_user")
    void createDBUser(String name, String pass);

    default Organisation findOne(Long organisationId) {
        return findById(organisationId).orElse(null);
    }
}
