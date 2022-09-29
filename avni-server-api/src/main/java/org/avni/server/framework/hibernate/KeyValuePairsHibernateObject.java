package org.avni.server.framework.hibernate;

import com.fasterxml.jackson.core.type.TypeReference;

import java.io.Serializable;
import java.util.Map;

public class KeyValuePairsHibernateObject extends TypeReference<Map<String, Object>> implements Serializable {
}
