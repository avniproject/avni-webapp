package org.avni.server.framework.tomcat;

import org.apache.tomcat.jdbc.pool.ConnectionPool;
import org.apache.tomcat.jdbc.pool.JdbcInterceptor;
import org.apache.tomcat.jdbc.pool.PooledConnection;
import org.avni.server.domain.Organisation;
import org.avni.server.domain.UserContext;
import org.avni.server.framework.security.UserContextHolder;

import java.lang.reflect.Method;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;


public class SetOrganisationJdbcInterceptor extends JdbcInterceptor {

    @Override
    public void reset(ConnectionPool connectionPool, PooledConnection pooledConnection) {
        UserContext userContext = UserContextHolder.getUserContext();
        if (userContext == null) {
            return;
        }
        Organisation organisation = userContext.getOrganisation();
        if (userContext.getUser() != null && userContext.getUser().isAdmin() && userContext.getOrganisationUUID() == null) {
            return;
        }
        if (organisation == null) return;

        String dbUser = organisation.getDbUser();
        if ("".equals(dbUser)) return;

        try {
            Statement statement = pooledConnection.getConnection().createStatement();
            statement.execute("set role \"" + dbUser + "\";");
            statement.execute("set application_name to \"" + dbUser + "\";");
            statement.close();
        } catch (SQLException exp) {
            throw new RuntimeException(exp);
        }
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {

        if ("close".equals(method.getName())) {
            Statement statement = ((Connection) proxy).createStatement();
            statement.execute("RESET ROLE");
            statement.close();
        }

        return super.invoke(proxy, method, args);
    }
}
