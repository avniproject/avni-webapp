package org.openchs.identifier;

import org.openchs.domain.IdentifierAssignment;
import org.openchs.domain.IdentifierSource;
import org.openchs.domain.User;

public interface IdentifierGenerator {
    void generateIdentifiers(IdentifierSource identifierSource, User user);
    IdentifierAssignment generateSingleIdentifier(IdentifierSource identifierSource, User user);
}
