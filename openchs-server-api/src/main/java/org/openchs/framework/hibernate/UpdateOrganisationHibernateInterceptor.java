package org.openchs.framework.hibernate;

import org.hibernate.CallbackException;
import org.hibernate.EmptyInterceptor;
import org.hibernate.type.Type;
import org.joda.time.DateTime;
import org.openchs.domain.Audit;
import org.openchs.domain.OrganisationAwareEntity;
import org.openchs.framework.security.UserContextHolder;

import java.io.Serializable;

public class UpdateOrganisationHibernateInterceptor extends EmptyInterceptor {
    @Override
    public boolean onSave(Object entity, Serializable id, Object[] state, String[] propertyNames, Type[] types) throws CallbackException {
        return updateOrganisationIdIfNeeded(entity, state, propertyNames) != null;
    }

    @Override
    public int[] findDirty(Object entity, Serializable id, Object[] currentState, Object[] previousState, String[] propertyNames, Type[] types) {
        return updateOrganisationIdIfNeeded(entity, currentState, propertyNames);
    }

    @Override
    public boolean onFlushDirty(Object entity, Serializable id, Object[] currentState, Object[] previousState, String[] propertyNames, Type[] types) {
        boolean somethingChanged = false;
        int indexOf = getIndexOf(propertyNames, "audit");
        if (indexOf != -1 && currentState[indexOf] != null) {
            Audit audit = (Audit) currentState[indexOf];
            audit.setLastModifiedDateTime(new DateTime());
            somethingChanged = true;
        }
        return somethingChanged;
    }

    private int getIndexOf(String[] propertyNames, String propertyName) {
        for (int i = 0; i < propertyNames.length; i++ ) {
            if (propertyNames[i].equals(propertyName)) return i;
        }
        return -1;
    }

    private int[] updateOrganisationIdIfNeeded(Object entity, Object[] currentState, String[] propertyNames) {
        if (entity instanceof OrganisationAwareEntity) {
            int organisationIdIndex = getIndexOf(propertyNames, "organisationId");
            Long organisationId = UserContextHolder.getUserContext().getOrganisation().getId();
            if (!organisationId.equals(currentState[organisationIdIndex])) {
                currentState[organisationIdIndex] = organisationId;
                return new int[]{organisationIdIndex};
            }
        }
        //used by onFlushDirty
        //this is to keep the default behaviour when we don't want to explicitly mark entity as dirty
        //null - use Hibernate's default dirty-checking algorithm
        return null;
    }
}
