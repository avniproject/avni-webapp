package org.avni.server.dao.application;

import org.avni.server.application.menu.MenuItem;
import org.avni.server.dao.CHSRepository;
import org.avni.server.dao.FindByLastModifiedDateTime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

@Repository
@RepositoryRestResource(collectionResourceRel = "menuItem", path = "menuItem")
public interface MenuItemRepository extends FindByLastModifiedDateTime<MenuItem>, CHSRepository<MenuItem>, JpaRepository<MenuItem, Long> {
}
