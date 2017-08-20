package org.openchs.dao;

import org.openchs.domain.CHSEntity;

public interface CHSRepository<T extends CHSEntity> {
    T findByUuid(String uuid);
}