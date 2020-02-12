package org.openchs.dao;


import org.openchs.domain.Account;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "account", path = "account")
public interface AccountRepository extends CrudRepository<Account, Long> {

    List<Account> findAllByAccountAdmin_User_IdOrderById(Long userId);

    default Account findOne(Long id) {
        return findById(id).orElse(null);
    }

    Account findByName(String accountName);
}
