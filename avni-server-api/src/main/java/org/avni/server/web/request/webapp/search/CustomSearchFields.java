package org.avni.server.web.request.webapp.search;

import java.io.Serializable;
import java.util.List;

public class CustomSearchFields implements Serializable {
    private String subjectTypeName;
    private String subjectTypeUUID;
    private List<SearchResultConcepts> searchResultConcepts;

    public String getSubjectTypeName() {
        return subjectTypeName;
    }

    public void setSubjectTypeName(String subjectTypeName) {
        this.subjectTypeName = subjectTypeName;
    }

    public String getSubjectTypeUUID() {
        return subjectTypeUUID;
    }

    public void setSubjectTypeUUID(String subjectTypeUUID) {
        this.subjectTypeUUID = subjectTypeUUID;
    }

    public List<SearchResultConcepts> getSearchResultConcepts() {
        return searchResultConcepts;
    }

    public void setSearchResultConcepts(List<SearchResultConcepts> searchResultConcepts) {
        this.searchResultConcepts = searchResultConcepts;
    }
}



