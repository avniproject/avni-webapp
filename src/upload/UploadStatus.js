import React from "react";
import { styled } from '@mui/material/styles';
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableRow, Box, TablePagination, Button } from "@mui/material";
import { Refresh } from "@mui/icons-material";
import { getStatuses } from "./reducers";
import { capitalize, get, isNil, map, includes } from "lodash";
import { staticTypesWithStaticDownload, staticTypesWithDynamicDownload } from "./Types";
import moment from "moment";
import FileDownloadButton from "../common/components/FileDownloadButton";
import UploadTypes from "./UploadTypes";

const StyledBox = styled(Box)({
  display: 'block'
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

const StyledDateCell = styled(TableCell)(({ theme }) => ({
  minWidth: 160
}));

const UploadStatus = ({ viewVersion, statuses, getStatuses, page = 0, uploadTypes = new UploadTypes() }) => {
  React.useEffect(() => {
    getStatuses(0);
  }, [viewVersion]);

  const changePage = (event, newPage) => {
    getStatuses(newPage);
  };

  return (
    <StyledBox>
      <StyledButton color="primary" variant="contained" onClick={() => getStatuses(page)}>
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
              <StyledDateCell align="right">{formatDate(jobStatus.createTime)}</StyledDateCell>
              <StyledDateCell align="right">{formatDate(jobStatus.startTime)}</StyledDateCell>
              <StyledDateCell align="right">{formatDate(jobStatus.endTime)}</StyledDateCell>
              <TableCell align="right">
                {jobStatus.status === "COMPLETED" && 0 < jobStatus.skipped ? "Completed with errors" : capitalize(jobStatus.status)}
              </TableCell>
              <TableCell align="right">{jobStatus.total}</TableCell>
              <TableCell align="right">{jobStatus.completed}</TableCell>
              <TableCell align="right">{jobStatus.skipped}</TableCell>
              <TableCell align="right">
                {jobStatus.status === "FAILED" || 0 < jobStatus.skipped ? (
                  <FileDownloadButton
                    url={`/import/errorfile?jobUuid=${jobStatus.uuid}`}
                    filename={`errors-${jobStatus.fileName.replace(".zip", ".csv")}`}
                    disabled={includes(["STARTING", "STARTED"], jobStatus.status)}
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
        page={page}
        backIconButtonProps={{ "aria-label": "previous page" }}
        nextIconButtonProps={{ "aria-label": "next page" }}
        onPageChange={changePage}
      />
    </StyledBox>
  );
};

const formatDate = date => (isNil(date) ? date : moment(date).format("YYYY-MM-DD HH:mm"));

const mapStateToProps = state => ({
  statuses: state.bulkUpload.statuses,
  page: state.bulkUpload.page,
  viewVersion: state.admin.ui.viewVersion,
  uploadTypes: state.bulkUpload.uploadTypes
});

export default withRouter(
  connect(
    mapStateToProps,
    { getStatuses }
  )(UploadStatus)
);