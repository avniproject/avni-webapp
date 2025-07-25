import { useSelector, useDispatch } from "react-redux";
import { styled } from "@mui/material/styles";
import { getUploadStatuses } from "../../reducers";
import { useState, useEffect } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  TablePagination,
  Button
} from "@mui/material";
import { find, get, isNil, map } from "lodash";
import { format, isValid } from "date-fns";
import { httpClient as http } from "common/utils/httpClient";
import fileDownload from "js-file-download";
import { Refresh, CloudDownload } from "@mui/icons-material";

const StyledBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  marginTop: theme.spacing(3)
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

const StyledPagination = styled(TablePagination)({
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  "& .MuiTablePagination-displayedRows": {
    margin: 0
  }
});

const JobStatus = ({
  operationalModules: { subjectTypes, programs, encounterTypes }
}) => {
  const dispatch = useDispatch();
  const exportJobStatuses = useSelector(
    state => state.reports.exportJobStatuses
  );

  useEffect(() => {
    dispatch(getUploadStatuses(0));
  }, [dispatch]);

  const rowsPerPage = 10;
  const [page, setPage] = useState(0);

  const formatDate = date =>
    isNil(date) || !isValid(new Date(date))
      ? date
      : format(new Date(date), "yyyy-MM-dd HH:mm");
  const isoDateFormat = date =>
    isNil(date) || !isValid(new Date(date))
      ? date
      : format(new Date(date), "yyyy-MM-dd");
  const getDateParams = ({ startDate, endDate }) =>
    isNil(startDate) || isNil(endDate)
      ? ""
      : `${isoDateFormat(startDate)} to ${isoDateFormat(endDate)}`;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    dispatch(getUploadStatuses(newPage));
  };

  const findEntityByUUID = (entities, statusEntityTypeUUID) =>
    find(entities, ({ uuid }) => uuid === statusEntityTypeUUID) || {};

  const onDownloadHandler = ({
    fileName,
    subjectTypeUUID,
    programUUID,
    encounterTypeUUID,
    startDate,
    endDate
  }) => {
    const outFileName = [
      findEntityByUUID(subjectTypes, subjectTypeUUID).name,
      findEntityByUUID(programs, programUUID).operationalProgramName,
      findEntityByUUID(encounterTypes, encounterTypeUUID)
        .operationalEncounterTypeName,
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
      .catch(error =>
        alert(`${error.message} Error occurred while downloading file`)
      );
  };

  return (
    <StyledBox>
      <Box
        sx={{ display: "flex", justifyContent: "flex-end", marginBottom: 2 }}
      >
        <Button color="primary" onClick={() => dispatch(getUploadStatuses(0))}>
          <Refresh />
          {" Refresh"}
        </Button>
      </Box>
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
              <StyledTableCellRow>
                {findEntityByUUID(subjectTypes, status.subjectTypeUUID).name}
              </StyledTableCellRow>
              <StyledTableCellRow>
                {
                  findEntityByUUID(programs, status.programUUID)
                    .operationalProgramName
                }
              </StyledTableCellRow>
              <StyledTableCellRow>
                {
                  findEntityByUUID(encounterTypes, status.encounterTypeUUID)
                    .operationalEncounterTypeName
                }
              </StyledTableCellRow>
              <StyledTableCellRow>{getDateParams(status)}</StyledTableCellRow>
              <StyledTableCellRow>
                {formatDate(status.startTime)}
              </StyledTableCellRow>
              <StyledTableCellRow>
                {formatDate(status.endTime)}
              </StyledTableCellRow>
              <StyledTableCellRow>{status.status}</StyledTableCellRow>
              <StyledTableCellRow>
                <Button
                  color="primary"
                  onClick={() => onDownloadHandler(status)}
                  disabled={status.status !== "COMPLETED"}
                >
                  <CloudDownload disabled={status.status !== "COMPLETED"} />
                  {" Download"}
                </Button>
              </StyledTableCellRow>
            </TableRow>
          ))}
        </TableBody>
      </StyledTable>
      <StyledPagination
        rowsPerPageOptions={[10]}
        component="div"
        count={get(exportJobStatuses, "totalElements") || 0}
        rowsPerPage={rowsPerPage}
        page={page}
        slotProps={{
          actions: {
            previousButton: { "aria-label": "previous page" },
            nextButton: { "aria-label": "next page" }
          }
        }}
        onPageChange={handleChangePage}
      />
    </StyledBox>
  );
};

export default JobStatus;
