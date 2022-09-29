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
}
