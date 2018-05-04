package org.openchs.builder;

import org.joda.time.DateTime;
import org.openchs.domain.OrganisationAwareEntity;
import org.openchs.framework.security.UserContextHolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.reflect.Method;
import java.util.Collection;

public abstract class BaseBuilder<T extends OrganisationAwareEntity, K> {
    private final Logger logger;
    protected T entity;
    protected T existingEntity;


    public BaseBuilder(T existingEntity, T newEntity) {
        this.entity = newEntity;
        this.existingEntity = existingEntity;
        logger = LoggerFactory.getLogger(this.getClass());
        this.get().setLastModifiedDateTime(new DateTime());
    }

    public K withUUID(String uuid) {
        this.get().setUuid(uuid);
        return (K) this;
    }

    protected void set(String key, Object val, Class clazz) {
        if (val == null) return;
        if (val instanceof Collection && ((Collection) val).size() == 0) return;
        if (val instanceof String && ((String) val).isEmpty()) return;
        try {
            T t = this.get();
            Method method = t.getClass().getMethod("set" + key, clazz);
            method.invoke(t, clazz.cast(val));
        } catch (Exception ignored) {
            logger.error("Error While Setting Value", ignored);
        }
    }

    public T get() {
        return this.build();
    }

    public T build() {
        return this.existingEntity == null ? entity : existingEntity;
    }
}
