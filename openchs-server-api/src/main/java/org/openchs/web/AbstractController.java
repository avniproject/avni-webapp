package org.openchs.web;

import org.joda.time.DateTime;
import org.openchs.common.EntityHelper;
import org.openchs.dao.CHSRepository;
import org.openchs.dao.UserRepository;
import org.openchs.domain.CHSEntity;
import org.openchs.web.request.CHSRequest;
import org.springframework.beans.factory.annotation.Autowired;

public abstract class AbstractController<T extends CHSEntity> {
    @Autowired
    private UserRepository userRepository;

    protected T newOrExistingEntity(CHSRepository<T> chsRepository, CHSRequest chsRequest, T chsEntity) {
        return EntityHelper.newOrExistingEntity(chsRepository,chsRequest,chsEntity);
    }
}