package org.openchs.server.domain;

import com.fasterxml.jackson.core.type.TypeReference;

import java.io.Serializable;
import java.util.Map;

public class KeyValuePairs extends TypeReference<Map<String, Object>> implements Serializable {
}