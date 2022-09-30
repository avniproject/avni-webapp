package org.avni.server.identifier;

import org.avni.server.identifier.IdentifierGenerator;
import org.avni.server.identifier.PrefixedUserPoolBasedIdentifierGenerator;
import org.avni.server.identifier.UserBasedIdentifierGenerator;
import org.junit.Test;
import org.avni.server.domain.IdentifierSource;
import org.avni.server.domain.JsonObject;
import org.avni.server.domain.User;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

public class UserBasedIdentifierGeneratorTest {

    @Test
    public void shouldGenerateIdentifiersBasedOnUserIdPrefix() {

        PrefixedUserPoolBasedIdentifierGenerator prefixedUserPoolBasedIdentifierGenerator = mock(PrefixedUserPoolBasedIdentifierGenerator.class);
        User user = new User();

        JsonObject settings = new JsonObject();
        settings.put("idPrefix", "ABC");
        user.setSettings(settings);

        IdentifierSource identifierSource = new IdentifierSource();
        identifierSource.setMinimumBalance(3L);
        identifierSource.setBatchGenerationSize(100L);

        IdentifierGenerator identifierGenerator = new UserBasedIdentifierGenerator(prefixedUserPoolBasedIdentifierGenerator);

        identifierGenerator.generateIdentifiers(identifierSource, user);

        verify(prefixedUserPoolBasedIdentifierGenerator).generateIdentifiers(identifierSource, user, "ABC");
    }
}
