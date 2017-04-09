package org.openchs.dao;

import org.openchs.domain.CHSEntity;

public interface ReferenceDataRepository<T extends CHSEntity> extends CHSRepository<T> {
    T findByName(String name);
}
