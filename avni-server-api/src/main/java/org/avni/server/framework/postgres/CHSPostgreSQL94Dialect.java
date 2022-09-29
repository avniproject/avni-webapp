package org.avni.server.framework.postgres;

import org.hibernate.dialect.PostgreSQL94Dialect;

import java.sql.Types;

public class CHSPostgreSQL94Dialect extends PostgreSQL94Dialect {

    private static final String JSONB = "jsonb";

    public CHSPostgreSQL94Dialect() {
        super();
        this.registerColumnType(Types.JAVA_OBJECT, JSONB);
    }
}
