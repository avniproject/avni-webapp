package org.openchs;

import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;

public class HibernateInitialiser {
    public HibernateInitialiser() {
        Configuration configuration = new Configuration();
        configuration.configure();
        configuration.buildSessionFactory();
    }
}