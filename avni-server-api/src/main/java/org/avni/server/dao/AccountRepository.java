package org.avni.server.dao;


import org.avni.server.domain.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.data.rest.core.annotation.RestResource;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RepositoryRestResource(collectionResourceRel = "account", path = "account")
public interface AccountRepository extends CrudRepository<Account, Long>, PagingAndSortingRepository<Account, Long>, JpaRepository<Account, Long> {

    List<Account> findAllByAccountAdmin_User_Id(Long userId);

    default Account findOne(Long id) {
        return findById(id).orElse(null);
    }

    Account findByName(String accountName);

    Page<Account> findByAccountAdmin_User_Id(Long userId, Pageable pageable);

    Account findByIdAndAccountAdmin_User_Id(Long id, Long userId);

    @RestResource(path = "findAllById", rel = "findAllById")
    List<Account> findByIdIn(@Param("ids") Long[] ids);

    Page<Account> findByAccountAdmin_User_IdAndNameIgnoreCaseContaining(Long userId, String name, Pageable pageable);
}
