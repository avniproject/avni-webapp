package org.avni.server.web.response;

import java.util.List;

public class ResponsePage {
    private List content;
    private int totalElements;
    private int totalPages;
    private int pageSize;

    public ResponsePage() {
    }

    public ResponsePage(List content, int totalElements, int totalPages, int pageSize) {
        this.content = content;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.pageSize = pageSize;
    }

    public List getContent() {
        return content;
    }

    public void setContent(List content) {
        this.content = content;
    }

    public int getTotalElements() {
        return totalElements;
    }

    public void setTotalElements(int totalElements) {
        this.totalElements = totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }
}
