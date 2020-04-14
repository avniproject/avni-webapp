package org.openchs.web.request.rules.response;

import java.util.List;

public interface Decisions {
    String getName();
    List<String> getValue();
    void setValue(List<String> value);
}
