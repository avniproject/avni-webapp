import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Tooltip from "@material-ui/core/Tooltip";
import RefreshIcon from "@material-ui/icons/Refresh";
import { getStatuses } from "./reducers";
import { capitalize, get, isNil, map, includes } from "lodash";
import { staticTypesWithStaticDownload, staticTypesWithDynamicDownload } from "./Types";
import moment from "moment";
import FileDownloadButton from "../common/components/FileDownloadButton";

import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import TablePagination from "@material-ui/core/TablePagination";
import Button from "@material-ui/core/Button";
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
        <RefreshIcon style={{ marginRight: 5 }} />
        {"REFRESH STATUS"}
      </Button>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>File name</TableCell>
            <TableCell align="right">Type</TableCell>
            <TableCell align="right" style={{ minWidth: 180 }}>
              Created at
            </TableCell>
            <TableCell align="right" style={{ minWidth: 180 }}>
              Started at
            </TableCell>
            <TableCell align="right" style={{ minWidth: 180 }}>
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
              <Tooltip title={<span style={{ fontSize: "2em" }}>{jobStatus.fileName}</span>} placement="bottom">
                <TableCell component="th" scope="jobStatus" className={classes.filename}>
                  {jobStatus.fileName}
                </TableCell>
              </Tooltip>
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
