package org.openchs.identifier;

import org.openchs.domain.IdentifierSource;
import org.openchs.domain.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

@Service
@Qualifier("userBasedIdentifierGenerator")
public class UserBasedIdentifierGenerator implements IdentifierGenerator {

    private PrefixedUserPoolBasedIdentifierGenerator prefixedUserPoolBasedIdentifierGenerator;


    @Autowired
    public UserBasedIdentifierGenerator(PrefixedUserPoolBasedIdentifierGenerator prefixedUserPoolBasedIdentifierGenerator) {
        this.prefixedUserPoolBasedIdentifierGenerator = prefixedUserPoolBasedIdentifierGenerator;
    }

    @Override
    public void generateIdentifiers(IdentifierSource identifierSource, User user) {
        assert user.getSettings() != null;
        String idPrefix = (String) user.getSettings().get("idPrefix");

        if (idPrefix == null) {
            throw new IllegalArgumentException("Missing idPrefix setting for user " + user.getUsername());
        }

        prefixedUserPoolBasedIdentifierGenerator.generateIdentifiers(identifierSource, user, idPrefix);
    }
}
