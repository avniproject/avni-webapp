package org.avni.identifier;

import org.avni.domain.IdentifierAssignment;
import org.avni.domain.IdentifierSource;
import org.avni.domain.User;

public interface IdentifierGenerator {
    void generateIdentifiers(IdentifierSource identifierSource, User user);
    IdentifierAssignment generateSingleIdentifier(IdentifierSource identifierSource, User user);
}
