package org.openchs.web;

import org.joda.time.DateTime;
import org.openchs.dao.CHSRepository;
import org.openchs.dao.UserRepository;
import org.openchs.domain.CHSEntity;
import org.openchs.web.request.CHSRequest;
import org.springframework.beans.factory.annotation.Autowired;

public abstract class AbstractController<T extends CHSEntity> {
    @Autowired
    private UserRepository userRepository;

    protected T newOrExistingEntity(CHSRepository<T> chsRepository, CHSRequest chsRequest, T chsEntity) {
        T t = chsRepository.findByUuid(chsRequest.getUuid());
        if (t == null) {
            t = chsEntity;
            t.getAudit().setCreatedBy(userRepository.findByUuid(chsRequest.getUserUUID()));
            t.getAudit().setCreatedDateTime(DateTime.now());
            t.setUuid(chsRequest.getUuid());
        }
        t.getAudit().setLastModifiedBy(userRepository.findByUuid(chsRequest.getUserUUID()));
        t.getAudit().setLastModifiedDateTime(DateTime.now());
        return t;
    }
}