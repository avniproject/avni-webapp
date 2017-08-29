package org.openchs.dao;

import org.openchs.domain.CHSEntity;

public class ReferenceDataRepositoryImpl<T extends CHSEntity> {
    public static CHSEntity findReferenceEntity(ReferenceDataRepository referenceDataRepository, String name, String uuid) {
        if (uuid == null)
            return referenceDataRepository.findByName(name);
        else
            return referenceDataRepository.findByUuid(uuid);
    }
}