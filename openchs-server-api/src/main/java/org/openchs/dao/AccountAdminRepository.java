package org.openchs.dao;

import org.openchs.domain.AccountAdmin;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "accountAdmin", path = "accountAdmin")
public interface AccountAdminRepository extends CrudRepository<AccountAdmin, Long> {

    AccountAdmin findByUser_IdAndAccount_Id(Long userId, Long accountId);

}
