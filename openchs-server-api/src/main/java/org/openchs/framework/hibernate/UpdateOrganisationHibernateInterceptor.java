package org.openchs.framework.hibernate;

import org.hibernate.CallbackException;
import org.hibernate.EmptyInterceptor;
import org.hibernate.type.Type;
import org.joda.time.DateTime;
import org.openchs.domain.Audit;
import org.openchs.domain.OrganisationAwareEntity;
import org.openchs.domain.User;
import org.openchs.domain.UserContext;
import org.openchs.framework.security.UserContextHolder;

import java.io.Serializable;

public class UpdateOrganisationHibernateInterceptor extends EmptyInterceptor {
    @Override
    public boolean onSave(Object entity, Serializable id, Object[] state, String[] propertyNames, Type[] types) throws CallbackException {
        return updateOrganisationId(entity, state, propertyNames);
    }

    @Override
    public boolean onFlushDirty(Object entity, Serializable id, Object[] currentState, Object[] previousState, String[] propertyNames, Type[] types) {
        boolean somethingChanged = false;
        int indexOf = getIndexOf(propertyNames, "audit");
        if (indexOf != -1 && currentState[indexOf] != null) {
            Audit audit = (Audit) currentState[indexOf];
            UserContext userContext = UserContextHolder.getUserContext();
            User user = userContext.getUser();
            if (audit.getCreatedBy() == null) {
                audit.setCreatedBy(user);
            }
            audit.setLastModifiedBy(user);
            audit.setLastModifiedDateTime(new DateTime());
            somethingChanged = true;
        }
        return updateOrganisationId(entity, currentState, propertyNames) || somethingChanged;
    }

    private int getIndexOf(String[] propertyNames, String propertyName) {
        for (int i = 0; i < propertyNames.length; i++ ) {
            if (propertyNames[i].equals(propertyName)) return i;
        }
        return -1;
    }

    private boolean updateOrganisationId(Object entity, Object[] currentState, String[] propertyNames) {
        if (entity instanceof OrganisationAwareEntity) {
            int organisationIdIndex = getIndexOf(propertyNames, "organisationId");
            Long organisationId = UserContextHolder.getUserContext().getOrganisation().getId();
            if (currentState[organisationIdIndex] == null) {
                currentState[organisationIdIndex] = organisationId;
                return true;
            }
        }
        return false;
    }
}
