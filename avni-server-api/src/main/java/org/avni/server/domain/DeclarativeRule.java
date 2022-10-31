package org.avni.server.domain;

import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;

public class DeclarativeRule extends ArrayList<Object> implements Serializable {
    public DeclarativeRule() {
    }

    public DeclarativeRule(@NotNull Collection<?> c) {
        this.clear();
        this.addAll(c);
    }

}
