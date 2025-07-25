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
  Button
} from "@mui/material";
import { Refresh } from "@mui/icons-material";
import { getStatuses } from "./reducers";
import { capitalize, get, isNil, map, includes } from "lodash";
import {
  staticTypesWithStaticDownload,
  staticTypesWithDynamicDownload
} from "./Types";
import { format, isValid } from "date-fns";
import FileDownloadButton from "../common/components/FileDownloadButton";
import UploadTypes from "./UploadTypes";

const StyledBox = styled(Box)({
  display: "block"
});

const StyledButton = styled(Button)(({ theme }) => ({
  float: "right",
  margin: theme.spacing(1)
}));

const StyledFileNameCell = styled(TableCell)({
  maxWidth: 180,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap"
});

const StyledDateCell = styled(TableCell)({
  minWidth: 160
});

const UploadStatus = () => {
  const dispatch = useDispatch();
  const statuses = useSelector(state => state.bulkUpload.statuses);
  const page = useSelector(state => state.bulkUpload.page);
  const uploadTypes =
    useSelector(state => state.bulkUpload.uploadTypes) || new UploadTypes();

  useEffect(() => {
    dispatch(getStatuses(0));
  }, [dispatch]);

  const changePage = (event, newPage) => {
    dispatch(getStatuses(newPage));
  };

  const formatDate = date =>
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
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="right">Execution Id</TableCell>
            <StyledFileNameCell>File name</StyledFileNameCell>
            <TableCell align="right">Download Input</TableCell>
            <TableCell align="right">Type</TableCell>
            <StyledDateCell align="right">Created at</StyledDateCell>
            <StyledDateCell align="right">Started at</StyledDateCell>
            <StyledDateCell align="right">Ended at</StyledDateCell>
            <TableCell align="right">Status</TableCell>
            <TableCell align="right">{"Rows/File read"}</TableCell>
            <TableCell align="right">{"Rows/File completed"}</TableCell>
            <TableCell align="right">{"Rows/File skipped"}</TableCell>
            <TableCell align="right">Failure</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {map(get(statuses, "content"), jobStatus => (
            <TableRow key={jobStatus.uuid}>
              <TableCell align="right">{jobStatus.executionId}</TableCell>
              <StyledFileNameCell component="th" scope="jobStatus">
                {jobStatus.fileName}
              </StyledFileNameCell>
              <TableCell align="right">
                <FileDownloadButton
                  url={`/import/inputFile?filePath=${jobStatus.s3Key}`}
                  filename={jobStatus.fileName}
                  disabled={includes(["STARTING"], jobStatus.status)}
                />
              </TableCell>
              <TableCell align="right">
                {staticTypesWithStaticDownload.getName(jobStatus.type) ||
                  staticTypesWithDynamicDownload.getName(jobStatus.type) ||
                  uploadTypes.getName(jobStatus.type) ||
                  jobStatus.type}
              </TableCell>
              <StyledDateCell align="right">
                {formatDate(jobStatus.createTime)}
              </StyledDateCell>
              <StyledDateCell align="right">
                {formatDate(jobStatus.startTime)}
              </StyledDateCell>
              <StyledDateCell align="right">
                {formatDate(jobStatus.endTime)}
              </StyledDateCell>
              <TableCell align="right">
                {jobStatus.status === "COMPLETED" && 0 < jobStatus.skipped
                  ? "Completed with errors"
                  : capitalize(jobStatus.status)}
              </TableCell>
              <TableCell align="right">{jobStatus.total}</TableCell>
              <TableCell align="right">{jobStatus.completed}</TableCell>
              <TableCell align="right">{jobStatus.skipped}</TableCell>
              <TableCell align="right">
                {jobStatus.status === "FAILED" || 0 < jobStatus.skipped ? (
                  <FileDownloadButton
                    url={`/import/errorfile?jobUuid=${jobStatus.uuid}`}
                    filename={`errors-${jobStatus.fileName.replace(
                      ".zip",
                      ".csv"
                    )}`}
                    disabled={includes(
                      ["STARTING", "STARTED"],
                      jobStatus.status
                    )}
                    buttonColor={"error"}
                  />
                ) : (
                  <div />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
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
