package org.avni.server.domain;

import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;

public class ChecklistItemStatus extends ArrayList<Object> implements Serializable {
    public ChecklistItemStatus() {
    }

    public ChecklistItemStatus(@NotNull Collection<?> c) {
        this.clear();
        this.addAll(c);
    }
}
