package org.openchs.identifier;

import org.junit.Test;
import org.openchs.domain.IdentifierSource;
import org.openchs.domain.JsonObject;
import org.openchs.domain.User;

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
