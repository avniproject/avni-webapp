package org.avni.dao;

import org.avni.server.dao.ImplementationRepository;
import org.junit.Test;
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
