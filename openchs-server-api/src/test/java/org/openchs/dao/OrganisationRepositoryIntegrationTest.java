package org.openchs.dao;

import org.junit.Test;
import org.openchs.common.AbstractControllerIntegrationTest;
import org.springframework.beans.factory.annotation.Autowired;

public class OrganisationRepositoryIntegrationTest extends AbstractControllerIntegrationTest {
    @Autowired
    private ImplementationRepository implementationRepository;

    @Test
    public void createSchema() {
        implementationRepository.createDBUser("impl-db-user", "password");
        implementationRepository.createImplementationSchema("impl-schema", "impl-db-user");
    }
}