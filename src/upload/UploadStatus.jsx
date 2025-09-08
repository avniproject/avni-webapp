import { useEffect } from "react";
import { styled } from "@mui/material/styles";
import { useSelector, useDispatch } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  TablePagination,
  Button,
  TableContainer,
  Paper,
} from "@mui/material";
import { Refresh } from "@mui/icons-material";
import { getStatuses } from "./reducers";
import { capitalize, get, isNil, map, includes } from "lodash";
import {
  staticTypesWithStaticDownload,
  staticTypesWithDynamicDownload,
} from "./Types";
import { format, isValid } from "date-fns";
import FileDownloadButton from "../common/components/FileDownloadButton";
import UploadTypes from "./UploadTypes";

const StyledBox = styled(Box)({
  display: "block",
});

const StyledButton = styled(Button)(({ theme }) => ({
  float: "right",
  margin: theme.spacing(1),
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  maxWidth: "100%",
  overflowX: "auto",
  marginTop: theme.spacing(1),
}));

const StyledFileNameCell = styled(TableCell)({
  maxWidth: 150,
  minWidth: 120,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const StyledDateCell = styled(TableCell)({
  minWidth: 140,
  maxWidth: 160,
  fontSize: "0.875rem",
});

const StyledCompactCell = styled(TableCell)({
  minWidth: 80,
  maxWidth: 100,
  padding: (theme) => theme.spacing(1),
  fontSize: "0.875rem",
});

const StyledStatusCell = styled(TableCell)({
  minWidth: 120,
  maxWidth: 150,
});

const UploadStatus = () => {
  const dispatch = useDispatch();
  const statuses = useSelector((state) => state.bulkUpload.statuses);
  const page = useSelector((state) => state.bulkUpload.page);
  const uploadTypes =
    useSelector((state) => state.bulkUpload.uploadTypes) || new UploadTypes();

  useEffect(() => {
    dispatch(getStatuses(0));
  }, [dispatch]);

  const changePage = (event, newPage) => {
    dispatch(getStatuses(newPage));
  };

  const formatDate = (date) =>
    isNil(date) || !isValid(new Date(date))
      ? date
      : format(new Date(date), "yyyy-MM-dd HH:mm");

  const handleRefresh = () => {
    dispatch(getStatuses(page));
  };

  return (
    <StyledBox>
      <StyledButton color="primary" variant="contained" onClick={handleRefresh}>
        <Refresh style={{ marginRight: 5 }} />
        {"REFRESH STATUS"}
      </StyledButton>
      <StyledTableContainer component={Paper}>
        <Table aria-label="upload status table" stickyHeader>
          <TableHead>
            <TableRow>
              <StyledCompactCell align="right">Execution Id</StyledCompactCell>
              <StyledFileNameCell>File name</StyledFileNameCell>
              <StyledCompactCell align="right">
                Download Input
              </StyledCompactCell>
              <StyledCompactCell align="right">Type</StyledCompactCell>
              <StyledDateCell align="right">Created at</StyledDateCell>
              <StyledDateCell align="right">Started at</StyledDateCell>
              <StyledDateCell align="right">Ended at</StyledDateCell>
              <StyledStatusCell align="right">Status</StyledStatusCell>
              <StyledCompactCell align="right">
                {"Rows/Files Read"}
              </StyledCompactCell>
              <StyledCompactCell align="right">
                {"Rows/Files Completed"}
              </StyledCompactCell>
              <StyledCompactCell align="right">
                {"Rows/Files Skipped"}
              </StyledCompactCell>
              <StyledCompactCell align="right">Failure</StyledCompactCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {map(get(statuses, "content"), (jobStatus) => (
              <TableRow key={jobStatus.uuid}>
                <StyledCompactCell align="right">
                  {jobStatus.executionId}
                </StyledCompactCell>
                <StyledFileNameCell component="th" scope="jobStatus">
                  {jobStatus.fileName}
                </StyledFileNameCell>
                <StyledCompactCell align="right">
                  <FileDownloadButton
                    url={`/import/inputFile?filePath=${jobStatus.s3Key}`}
                    filename={jobStatus.fileName}
                    disabled={includes(["STARTING"], jobStatus.status)}
                  />
                </StyledCompactCell>
                <StyledCompactCell align="right">
                  {staticTypesWithStaticDownload.getName(jobStatus.type) ||
                    staticTypesWithDynamicDownload.getName(jobStatus.type) ||
                    uploadTypes.getName(jobStatus.type) ||
                    jobStatus.type}
                </StyledCompactCell>
                <StyledDateCell align="right">
                  {formatDate(jobStatus.createTime)}
                </StyledDateCell>
                <StyledDateCell align="right">
                  {formatDate(jobStatus.startTime)}
                </StyledDateCell>
                <StyledDateCell align="right">
                  {formatDate(jobStatus.endTime)}
                </StyledDateCell>
                <StyledStatusCell align="right">
                  {jobStatus.status === "COMPLETED" && 0 < jobStatus.skipped
                    ? "Completed with errors"
                    : capitalize(jobStatus.status)}
                </StyledStatusCell>
                <StyledCompactCell align="right">
                  {jobStatus.total}
                </StyledCompactCell>
                <StyledCompactCell align="right">
                  {jobStatus.completed}
                </StyledCompactCell>
                <StyledCompactCell align="right">
                  {jobStatus.skipped}
                </StyledCompactCell>
                <StyledCompactCell align="right">
                  {jobStatus.status === "FAILED" || 0 < jobStatus.skipped ? (
                    <FileDownloadButton
                      url={`/import/errorfile?jobUuid=${jobStatus.uuid}`}
                      filename={`errors-${jobStatus.fileName.replace(
                        ".zip",
                        ".csv",
                      )}`}
                      disabled={includes(
                        ["STARTING", "STARTED"],
                        jobStatus.status,
                      )}
                      buttonColor={"error"}
                    />
                  ) : (
                    <div />
                  )}
                </StyledCompactCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
      <TablePagination
        rowsPerPageOptions={[5]}
        component="div"
        count={get(statuses, "totalElements") || 0}
        rowsPerPage={5}
        page={page || 0}
        backIconButtonProps={{ "aria-label": "previous page" }}
        nextIconButtonProps={{ "aria-label": "next page" }}
        onPageChange={changePage}
      />
    </StyledBox>
  );
};

export default UploadStatus;
