package org.avni.server.web.request.webapp.search;

public class PageDetails {
    private Integer pageNumber;
    private Integer numberOfRecordPerPage;
    private String sortColumn;
    private String sortOrder;

    public Integer getPageNumber() {
        return pageNumber;
    }

    public void setPageNumber(Integer pageNumber) {
        this.pageNumber = pageNumber;
    }

    public Integer getNumberOfRecordPerPage() {
        return numberOfRecordPerPage;
    }

    public void setNumberOfRecordPerPage(Integer numberOfRecordsPerPage) {
        this.numberOfRecordPerPage = numberOfRecordsPerPage;
    }

    public String getSortColumn() {
        return sortColumn;
    }

    public void setSortColumn(String sortColumn) {
        this.sortColumn = sortColumn;
    }

    public String getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(String sortOrder) {
        this.sortOrder = sortOrder;
    }
}
