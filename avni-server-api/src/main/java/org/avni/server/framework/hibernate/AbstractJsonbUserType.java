package org.avni.server.framework.hibernate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.joda.JodaModule;
import org.hibernate.HibernateException;
import org.hibernate.engine.spi.SharedSessionContractImplementor;
import org.hibernate.usertype.UserType;

import java.io.*;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;

public abstract class AbstractJsonbUserType extends AbstractUserType implements UserType {
    public final static ObjectMapper mapper = new ObjectMapper().registerModule(new JodaModule());

    @Override
    public int[] sqlTypes() {
        return new int[]{Types.JAVA_OBJECT};
    }

    @Override
    public Object nullSafeGet(final ResultSet rs, final String[] names, final SharedSessionContractImplementor session,
                              final Object owner) throws HibernateException, SQLException {
        final String cellContent = rs.getString(names[0]);
        if (cellContent == null) {
            return null;
        }
        try {
            return mapper.readValue(cellContent.getBytes("UTF-8"), returnedClass());
        } catch (final Exception ex) {
            throw new RuntimeException("Failed to convert String to Invoice: " + ex.getMessage(), ex);
        }
    }

    @Override
    public void nullSafeSet(final PreparedStatement ps, final Object value, final int idx,
                            final SharedSessionContractImplementor session) throws HibernateException, SQLException {
        if (value == null) {
            ps.setNull(idx, Types.OTHER);
            return;
        }
        try {
            final StringWriter w = new StringWriter();
            mapper.writeValue(w, value);
            w.flush();
            ps.setObject(idx, w.toString(), Types.OTHER);
        } catch (final Exception ex) {
            throw new RuntimeException("Failed to convert Invoice to String: " + ex.getMessage(), ex);
        }
    }
}
