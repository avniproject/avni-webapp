package org.openchs.importer.batch.model;

public class JsonFile {

    private String jsonData;
    private String name;

    public JsonFile(String name, String jsonData) {
        this.name = name;
        this.jsonData = jsonData;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getJsonData() {
        return jsonData;
    }

    public void setJsonData(String jsonData) {
        this.jsonData = jsonData;
    }
}
