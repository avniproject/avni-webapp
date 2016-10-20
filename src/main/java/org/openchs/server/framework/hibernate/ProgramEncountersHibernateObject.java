package org.openchs.server.framework.hibernate;

import com.fasterxml.jackson.core.type.TypeReference;
import org.openchs.server.domain.ProgramEncounter;

import java.io.Serializable;
import java.util.List;

public class ProgramEncountersHibernateObject extends TypeReference<List<ProgramEncounter>> implements Serializable {
}