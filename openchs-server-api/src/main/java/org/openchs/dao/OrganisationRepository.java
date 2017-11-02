package org.openchs.dao;

import org.openchs.domain.Organisation;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrganisationRepository extends CrudRepository<Organisation, Long> {

    Organisation findByName(String name);
}
