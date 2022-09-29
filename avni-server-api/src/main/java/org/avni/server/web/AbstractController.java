package org.avni.server.web;

import org.avni.server.common.EntityHelper;
import org.avni.server.dao.CHSRepository;
import org.avni.server.domain.CHSEntity;
import org.avni.server.web.request.CHSRequest;

public abstract class AbstractController<T extends CHSEntity> {

    protected T newOrExistingEntity(CHSRepository<T> chsRepository, CHSRequest chsRequest, T chsEntity) {
        return EntityHelper.newOrExistingEntity(chsRepository, chsRequest, chsEntity);
    }
}
