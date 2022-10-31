package org.avni.server.domain;

import javax.persistence.Column;
import javax.persistence.MappedSuperclass;

@MappedSuperclass
public class ETLEntity {

    @Column
    private String name;

    @Column
    private String dbUser;

    @Column
    private String schemaName;

    @Column(name = "has_analytics_db")
    private boolean hasAnalyticsDb;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDbUser() {
        return dbUser;
    }

    public void setDbUser(String dbUser) {
        this.dbUser = dbUser;
    }

    public String getSchemaName() {
        return schemaName;
    }

    public void setSchemaName(String schemaName) {
        this.schemaName = schemaName;
    }

    public boolean isHasAnalyticsDb() {
        return hasAnalyticsDb;
    }

    public void setHasAnalyticsDb(boolean hasAnalyticsDb) {
        this.hasAnalyticsDb = hasAnalyticsDb;
    }
}
