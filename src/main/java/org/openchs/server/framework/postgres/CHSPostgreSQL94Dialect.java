package org.openchs.server.framework.postgres;

import org.hibernate.dialect.PostgreSQL94Dialect;
import java.sql.Types;

public class CHSPostgreSQL94Dialect extends PostgreSQL94Dialect {
    public CHSPostgreSQL94Dialect() {
        super();
        this.registerColumnType(Types.JAVA_OBJECT, "jsonb");
    }
}