package org.openchs.dao;

import org.openchs.domain.CHSEntity;

import java.util.List;

public interface CHSRepository<T extends CHSEntity> {
    T findByUuid(String uuid);
    List<T> findAll();
}