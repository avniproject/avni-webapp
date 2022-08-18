package org.avni.dao.application;

import org.avni.application.menu.MenuItem;
import org.avni.dao.CHSRepository;
import org.avni.dao.FindByLastModifiedDateTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "menuItem", path = "menuItem")
public interface MenuItemRepository extends FindByLastModifiedDateTime<MenuItem>, CHSRepository<MenuItem>, JpaRepository<MenuItem, Long> {
}
