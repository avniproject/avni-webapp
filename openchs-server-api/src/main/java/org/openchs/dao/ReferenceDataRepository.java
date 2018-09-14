package org.openchs.dao;

import org.openchs.domain.CHSEntity;

import java.util.Collection;
import java.util.List;

public interface ReferenceDataRepository<T extends CHSEntity> extends CHSRepository<T> {
    T findByName(String name);
    T findByNameIgnoreCase(String name);
}
