package org.openchs.geo;

import java.io.Serializable;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import org.hibernate.HibernateException;
import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.usertype.UserType;
import org.postgresql.geometric.PGpoint;

/**
 * A Hibernate <b>UserType</b> for PostgreSQL's <b>point</b> type.
 *
 * @author Jesse Costello-Good
 * @version $Id$
 */
public class PointType implements UserType {

    @Override
    public int[] sqlTypes() {
        return new int[]{java.sql.Types.OTHER};
    }

    @Override
    public Class returnedClass() {
        return Point.class;
    }

    @Override
    public boolean equals(Object o, Object o1) throws HibernateException {
        if (o == null && o1 == null)
            return true;
        else if (o == null || o1 == null)
            return false;
        return o.equals(o1);
    }

    @Override
    public Object nullSafeGet(ResultSet resultSet, String[] names, SharedSessionContractImplementor sessionImplementor, Object owner) throws HibernateException, SQLException {
        if (names.length != 1)
            throw new IllegalArgumentException("names.length != 1, names = " + names);

        PGpoint value = (PGpoint) resultSet.getObject(names[0]);

        if (value == null) {
            return null;
        } else {
            return new Point(value.x, value.y);
        }
    }

    @Override
    public void nullSafeSet(PreparedStatement preparedStatement, Object value, int i, SharedSessionContractImplementor sessionImplementor) throws HibernateException, SQLException {
        if (value == null) {
            preparedStatement.setNull(i, java.sql.Types.OTHER);
        } else {
            preparedStatement.setObject(i, new PGpoint(((Point) value).getX(), ((Point) value).getY()));
        }
    }

    @Override
    public Object deepCopy(Object o) throws HibernateException {
        if (o == null)
            return null;

        try {
            return ((Point) o).clone();
        } catch (CloneNotSupportedException e) {
            throw new IllegalArgumentException(e);
        }
    }

    @Override
    public boolean isMutable() {
        return false;
    }

    @Override
    public int hashCode(Object o) throws HibernateException {
        return o.hashCode();
    }

    @Override
    public Serializable disassemble(Object o) throws HibernateException {
        return (Serializable) o;
    }

    @Override
    public Object assemble(Serializable cached, Object owner) throws HibernateException {
        return cached;
    }

    @Override
    public Object replace(Object original, Object target, Object owner) throws HibernateException {
        return original;
    }
}