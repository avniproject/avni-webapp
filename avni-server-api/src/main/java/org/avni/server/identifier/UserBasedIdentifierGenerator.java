package org.avni.server.identifier;

import org.avni.server.domain.IdentifierAssignment;
import org.avni.server.domain.IdentifierSource;
import org.avni.server.domain.User;
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
        String idPrefix = getIdPrefix(user);
        prefixedUserPoolBasedIdentifierGenerator.generateIdentifiers(identifierSource, user, idPrefix);
    }

    @Override
    public IdentifierAssignment generateSingleIdentifier(IdentifierSource identifierSource, User user) {
        String idPrefix = getIdPrefix(user);
        IdentifierAssignment identifierAssignment = prefixedUserPoolBasedIdentifierGenerator.generateSingleIdentifier(identifierSource, user, idPrefix);
        return identifierAssignment;
    }

    private String getIdPrefix(User user) {
        assert user.getSettings() != null;
        String idPrefix = (String) user.getSettings().get("idPrefix");
        if (idPrefix == null) {
            throw new IllegalArgumentException("Missing idPrefix setting for user " + user.getUsername());
        }
        return idPrefix;
    }
}
