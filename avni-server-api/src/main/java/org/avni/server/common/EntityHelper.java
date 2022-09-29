package org.avni.server.common;

import org.avni.server.dao.CHSRepository;
import org.avni.server.domain.CHSEntity;
import org.avni.server.web.request.CHSRequest;
import org.springframework.util.StringUtils;

import java.util.UUID;

public class EntityHelper<T extends CHSEntity> {

    public static <T extends CHSEntity> T newOrExistingEntity(CHSRepository<T> chsRepository, CHSRequest chsRequest, T chsEntity) {
        return newOrExistingEntity(chsRepository, chsRequest.getUuid(), chsRequest.getId(), chsEntity);
    }

    public static <T extends CHSEntity> T newOrExistingEntity(CHSRepository<T> chsRepository, String uuid, Long id, T chsEntity) {
        T t = null;
        if (StringUtils.hasText(uuid)) {
            t = chsRepository.findByUuid(uuid);
        }
        if (t == null) {
            t = chsRepository.findEntity(id);
        }
        if (t == null) {
            t = chsEntity;
            t.setUuid(uuid != null ? uuid : UUID.randomUUID().toString());
        }
        return t;
    }
}
