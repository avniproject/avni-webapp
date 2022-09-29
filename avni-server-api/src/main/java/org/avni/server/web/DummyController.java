package org.avni.server.web;

import org.avni.server.domain.Checklist;
import org.springframework.data.domain.PageImpl;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@RestController
public class DummyController {
    private Map<Object, Object> getEmptyMap(String entityName) {
        HashMap<Object, Object> map = new HashMap<>();
        PageImpl<Checklist> page = new PageImpl<>(new ArrayList<>());
        map.put("page", page);
        map.put("_links", new Object());
        HashMap<Object, Object> embedded = new HashMap<>();
        embedded.put(entityName, new ArrayList<>());
        map.put("_embedded", embedded);
        return map;
    }

    @RequestMapping("/checklist/search/byIndividualsOfCatchmentAndLastModified")
    public Map<Object, Object> checklists() {
        return getEmptyMap("checklist");
    }

    @RequestMapping("/addressLevel/search/byCatchmentAndLastModified")
    public Map<Object, Object> addressLevels() {
        return getEmptyMap("addressLevel");
    }

    @RequestMapping("/checklistItem/search/byIndividualsOfCatchmentAndLastModified")
    public Map<Object, Object> checklistItems() {
        return getEmptyMap("checklistItem");
    }
}
