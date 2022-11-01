package org.avni.server.domain.factory.metadata;

import org.avni.server.domain.Concept;

public class ConceptBuilder {
    private Concept concept = new Concept();

    public ConceptBuilder withUuid(String uuid) {
        concept.setUuid(uuid);
        return this;
    }

    public Concept build() {
        return concept;
    }
}
