package org.openchs.framework.hibernate;

import org.hibernate.CallbackException;
import org.hibernate.EmptyInterceptor;
import org.hibernate.type.Type;
import org.openchs.domain.OrganisationAwareEntity;
import org.openchs.framework.security.UserContextHolder;

import java.io.Serializable;

public class UpdateOrganisationHibernateInterceptor extends EmptyInterceptor {

    @Override
    public boolean onSave(Object entity, Serializable id, Object[] state, String[] propertyNames, Type[] types) throws CallbackException {
        return updateOrganisationId(entity, state, propertyNames);
    }

    @Override
    public boolean onFlushDirty(Object entity, Serializable id, Object[] currentState, Object[] previousState, String[] propertyNames, Type[] types) {
        return updateOrganisationId(entity, currentState, propertyNames);
    }

    private boolean updateOrganisationId(Object entity, Object[] currentState, String[] propertyNames) {
        if (entity instanceof OrganisationAwareEntity) {
            int organisationIdIndex = findOrganisationIdIndex(propertyNames);
            currentState[organisationIdIndex] = UserContextHolder.getUserContext().getOrganisation().getId();
            return true;
        }

        return false;
    }

    private int findOrganisationIdIndex(String[] propertyNames) {
        for (int i = 0; i < propertyNames.length; i++) {
            if ("organisationId".equalsIgnoreCase(propertyNames[i])) return i;
        }
        return -1;
    }
}
