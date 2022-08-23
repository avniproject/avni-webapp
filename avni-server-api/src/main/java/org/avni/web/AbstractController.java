package org.avni.web;

import org.avni.common.EntityHelper;
import org.avni.dao.CHSRepository;
import org.avni.domain.CHSEntity;
import org.avni.web.request.CHSRequest;

public abstract class AbstractController<T extends CHSEntity> {

    protected T newOrExistingEntity(CHSRepository<T> chsRepository, CHSRequest chsRequest, T chsEntity) {
        return EntityHelper.newOrExistingEntity(chsRepository, chsRequest, chsEntity);
    }
}
