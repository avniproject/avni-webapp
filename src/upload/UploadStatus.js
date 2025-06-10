import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import { Table, TableBody, TableCell, TableHead, TableRow, Box, TablePagination, Button } from "@mui/material";
import { Refresh } from "@mui/icons-material";
import { getStatuses } from "./reducers";
import { capitalize, get, isNil, map, includes } from "lodash";
import { staticTypesWithStaticDownload, staticTypesWithDynamicDownload } from "./Types";
import moment from "moment";
import FileDownloadButton from "../common/components/FileDownloadButton";
import UploadTypes from "./UploadTypes";

const createStyles = makeStyles(theme => ({
  filename: {
    maxWidth: 180,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  }
}));

const UploadStatus = ({ viewVersion, statuses, getStatuses, page = 0, uploadTypes = new UploadTypes() }) => {
  const classes = createStyles();
  React.useEffect(() => {
    getStatuses(0);
  }, [viewVersion]);

  const changePage = (event, newPage) => {
    getStatuses(newPage);
  };

  return (
    <Box>
      <Button color="primary" variant="contained" onClick={() => getStatuses(page)} style={{ float: "right", margin: "10px" }}>
        <Refresh style={{ marginRight: 5 }} />
        {"REFRESH STATUS"}
      </Button>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="right">Execution Id</TableCell>
            <TableCell style={{ minWidth: 160 }}>File name</TableCell>
            <TableCell align="right">Download Input</TableCell>
            <TableCell align="right">Type</TableCell>
            <TableCell align="right" style={{ minWidth: 160 }}>
              Created at
            </TableCell>
            <TableCell align="right" style={{ minWidth: 160 }}>
              Started at
            </TableCell>
            <TableCell align="right" style={{ minWidth: 160 }}>
              Ended at
            </TableCell>
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
              <TableCell component="th" scope="jobStatus" className={classes.filename}>
                {jobStatus.fileName}
              </TableCell>
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
              <TableCell align="right">{formatDate(jobStatus.createTime)}</TableCell>
              <TableCell align="right">{formatDate(jobStatus.startTime)}</TableCell>
              <TableCell align="right">{formatDate(jobStatus.endTime)}</TableCell>
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
    </Box>
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
