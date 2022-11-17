package org.avni.server.framework.hibernate;

import org.hibernate.HibernateException;
import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.usertype.UserType;

import java.sql.*;

public class ArrayUserType extends AbstractUserType implements UserType {

    @Override
    public int[] sqlTypes() {
        return new int[]{Types.ARRAY};
    }

    @Override
    public Class returnedClass() {
        return String[].class;
    }

    @Override
    public Object nullSafeGet(ResultSet rs, String[] names, SharedSessionContractImplementor session, Object owner)
            throws HibernateException, SQLException {
        Array array = rs.getArray(names[0]);
        return array != null ? array.getArray() : null;
    }

    @Override
    public void nullSafeSet(PreparedStatement st, Object value, int index, SharedSessionContractImplementor session)
            throws HibernateException, SQLException {
        if (value != null && st != null) {
            Array array = session.connection().createArrayOf("text", (String[]) value);
            st.setArray(index, array);
        } else {
            st.setNull(index, sqlTypes()[0]);
        }
    }

    @Override
    public boolean equals(Object x, Object y) throws HibernateException {
        if (x == null && y == null) {
            return true;
        }
        if (x == null || y == null) {
            return false;
        }

        if (x == y) {
            return true;
        }

        if (!(x instanceof String[] || y instanceof String[])) {
            return false;
        }

        String[] xArray = (String[]) x;
        String[] yArray = (String[]) y;
        if (xArray.length != yArray.length) {
            return false;
        }
        for (int i = 0; i < xArray.length; i++) {
            if (!xArray[i].equals(yArray[i])) {
                return false;
            }
        }
        return true;
    }
}
