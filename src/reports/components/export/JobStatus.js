import { connect } from "react-redux";
import { styled } from "@mui/material/styles";
import { getUploadStatuses } from "../../reducers";
import { withRouter } from "react-router-dom";
import { useState, useEffect } from "react";
import { Table, TableHead, TableRow, TableCell, TableBody, Box, Grid, TablePagination, Button } from "@mui/material";
import { find, get, isNil, map } from "lodash";
import moment from "moment";
import { httpClient as http } from "common/utils/httpClient";
import fileDownload from "js-file-download";
import { Refresh, CloudDownload } from "@mui/icons-material";

const StyledBox = styled(Box)(({ theme }) => ({
  display: "flex",
  marginTop: theme.spacing(3),
  overflowX: "hidden"
}));

const StyledTable = styled(Table)({
  minWidth: 340
});

const StyledTableCellHeader = styled(TableCell)({
  paddingRight: 4,
  paddingLeft: 5,
  fontWeight: "bold"
});

const StyledTableCellRow = styled(TableCell)({
  paddingRight: 4,
  paddingLeft: 5
});

const JobStatus = ({ exportJobStatuses, getUploadStatuses, operationalModules: { subjectTypes, programs, encounterTypes } }) => {
  useEffect(() => {
    getUploadStatuses(0);
  }, []);

  const rowsPerPage = 10;
  const [page, setPage] = useState(0);

  const formatDate = date => (isNil(date) ? date : moment(date).format("YYYY-MM-DD HH:mm"));
  const isoDateFormat = date => (isNil(date) ? date : moment(date).format("YYYY-MM-DD"));
  const getDateParams = ({ startDate, endDate }) =>
    isNil(startDate) || isNil(endDate) ? "" : `${isoDateFormat(startDate)} to ${isoDateFormat(endDate)}`;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    getUploadStatuses(newPage);
  };

  const findEntityByUUID = (entities, statusEntityTypeUUID) => find(entities, ({ uuid }) => uuid === statusEntityTypeUUID) || {};

  const onDownloadHandler = ({ fileName, subjectTypeUUID, programUUID, encounterTypeUUID, startDate, endDate }) => {
    const outFileName = [
      findEntityByUUID(subjectTypes, subjectTypeUUID).name,
      findEntityByUUID(programs, programUUID).operationalProgramName,
      findEntityByUUID(encounterTypes, encounterTypeUUID).operationalEncounterTypeName,
      isoDateFormat(startDate),
      isoDateFormat(endDate)
    ]
      .filter(Boolean)
      .join("_");
    http
      .get(`/export/download?fileName=${fileName}`, { responseType: "blob" })
      .then(response => {
        fileDownload(response.data, `${outFileName}.csv`);
      })
      .catch(error => alert(`${error.message} Error occurred while downloading file`));
  };

  return (
    <StyledBox>
      <Grid container direction="row" sx={{ justifyContent: "flex-end" }}>
        <Button color="primary" onClick={() => getUploadStatuses(0)}>
          <Refresh />
          {" Refresh"}
        </Button>
      </Grid>
      <StyledTable>
        <TableHead>
          <TableRow>
            <StyledTableCellHeader>Report Type</StyledTableCellHeader>
            <StyledTableCellHeader>Subject type</StyledTableCellHeader>
            <StyledTableCellHeader>Program</StyledTableCellHeader>
            <StyledTableCellHeader>Encounter type</StyledTableCellHeader>
            <StyledTableCellHeader>Date range</StyledTableCellHeader>
            <StyledTableCellHeader>Report Requested at</StyledTableCellHeader>
            <StyledTableCellHeader>Report Generated at</StyledTableCellHeader>
            <StyledTableCellHeader>Status</StyledTableCellHeader>
            <StyledTableCellHeader>Download</StyledTableCellHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {map(get(exportJobStatuses, "content"), status => (
            <TableRow key={status.uuid}>
              <StyledTableCellRow>{status.reportType}</StyledTableCellRow>
              <StyledTableCellRow>{findEntityByUUID(subjectTypes, status.subjectTypeUUID).name}</StyledTableCellRow>
              <StyledTableCellRow>{findEntityByUUID(programs, status.programUUID).operationalProgramName}</StyledTableCellRow>
              <StyledTableCellRow>
                {findEntityByUUID(encounterTypes, status.encounterTypeUUID).operationalEncounterTypeName}
              </StyledTableCellRow>
              <StyledTableCellRow>{getDateParams(status)}</StyledTableCellRow>
              <StyledTableCellRow>{formatDate(status.startTime)}</StyledTableCellRow>
              <StyledTableCellRow>{formatDate(status.endTime)}</StyledTableCellRow>
              <StyledTableCellRow>{status.status}</StyledTableCellRow>
              <StyledTableCellRow>
                <Button color="primary" onClick={() => onDownloadHandler(status)} disabled={status.status !== "COMPLETED"}>
                  <CloudDownload disabled={status.status !== "COMPLETED"} />
                  {" Download"}
                </Button>
              </StyledTableCellRow>
            </TableRow>
          ))}
        </TableBody>
      </StyledTable>
      <TablePagination
        rowsPerPageOptions={[10]}
        component="div"
        count={get(exportJobStatuses, "totalElements") || 0}
        rowsPerPage={rowsPerPage}
        page={page}
        backIconButtonProps={{ "aria-label": "previous page" }}
        nextIconButtonProps={{ "aria-label": "next page" }}
        onPageChange={handleChangePage}
      />
    </StyledBox>
  );
};

const mapStateToProps = state => ({
  exportJobStatuses: state.reports.exportJobStatuses
});

export default withRouter(
  connect(
    mapStateToProps,
    { getUploadStatuses }
  )(JobStatus)
);
