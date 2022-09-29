package org.avni.identifier;

import org.avni.server.identifier.IdentifierGenerator;
import org.avni.server.identifier.PrefixedUserPoolBasedIdentifierGenerator;
import org.avni.server.identifier.UserBasedIdentifierGenerator;
import org.junit.Test;
import org.avni.server.domain.IdentifierSource;
import org.avni.server.domain.JsonObject;
import org.avni.server.domain.User;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

public class UserPoolBasedIdentifierGeneratorTest {

    @Test
    public void shouldGenerateIdentifiersBasedOnPrefixOfIdentifierSource() {

        PrefixedUserPoolBasedIdentifierGenerator prefixedUserPoolBasedIdentifierGenerator = mock(PrefixedUserPoolBasedIdentifierGenerator.class);
        User user = new User();

        IdentifierSource identifierSource = new IdentifierSource();
        identifierSource.setMinimumBalance(3L);
        identifierSource.setBatchGenerationSize(100L);
        JsonObject options = new JsonObject();
        options.put("idPrefix", "ABC");
        user.setSettings(options);
        identifierSource.setOptions(options);

        IdentifierGenerator identifierGenerator = new UserBasedIdentifierGenerator(prefixedUserPoolBasedIdentifierGenerator);

        identifierGenerator.generateIdentifiers(identifierSource, user);

        verify(prefixedUserPoolBasedIdentifierGenerator).generateIdentifiers(identifierSource, user, "ABC");
    }
}
