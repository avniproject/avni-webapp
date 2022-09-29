package org.avni.server.framework.hibernate;

import org.avni.server.domain.Organisation;
import org.avni.server.domain.OrganisationAwareEntity;
import org.hibernate.CallbackException;
import org.hibernate.EmptyInterceptor;
import org.hibernate.type.Type;
import org.avni.server.framework.security.UserContextHolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.Serializable;

public class UpdateOrganisationHibernateInterceptor extends EmptyInterceptor {
    private static final Logger logger = LoggerFactory.getLogger(UpdateOrganisationHibernateInterceptor.class.getName());

    @Override
    public boolean onSave(Object entity, Serializable id, Object[] state, String[] propertyNames, Type[] types) throws CallbackException {
        return updateOrganisationId(entity, state, propertyNames);
    }

    @Override
    public boolean onFlushDirty(Object entity, Serializable id, Object[] currentState, Object[] previousState, String[] propertyNames, Type[] types) {
        boolean somethingChanged = false;
        return updateOrganisationId(entity, currentState, propertyNames) || somethingChanged;
    }

    private int getIndexOf(String[] propertyNames, String propertyName) {
        for (int i = 0; i < propertyNames.length; i++) {
            if (propertyNames[i].equals(propertyName)) return i;
        }
        return -1;
    }

    private boolean updateOrganisationId(Object entity, Object[] currentState, String[] propertyNames) {
        if (entity instanceof OrganisationAwareEntity) {
            int organisationIdIndex = getIndexOf(propertyNames, "organisationId");
            Organisation organisation = UserContextHolder.getUserContext().getOrganisation();
            if (organisation == null) {
                return false;
            }
            if (currentState[organisationIdIndex] == null) {
                currentState[organisationIdIndex] = organisation.getId();
                return true;
            }
        }
        return false;
    }
}
