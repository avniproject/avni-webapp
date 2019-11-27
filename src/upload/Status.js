import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Tooltip from "@material-ui/core/Tooltip";
import { getStatuses } from "./reducers";
import { get, isNil, map, capitalize } from "lodash";
import Types from "./Types";
import moment from "moment";
import FileDownloadButton from "../common/components/FileDownloadButton";

import { makeStyles } from "@material-ui/core/styles";

const createStyles = makeStyles(theme => ({
  filename: {
    maxWidth: 180,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  }
}));

const Status = ({ viewVersion, statuses, getStatuses }) => {
  const classes = createStyles();
  React.useEffect(() => {
    getStatuses();
  }, [viewVersion]);

  return (
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
          <TableCell align="right">{"Rows read"}</TableCell>
          <TableCell align="right">{"Rows completed"}</TableCell>
          <TableCell align="right">{"Rows skipped"}</TableCell>
          <TableCell align="right">Failure</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {map(get(statuses, "_embedded.jobStatuses"), jobStatus => (
          <TableRow key={jobStatus.uuid}>
            <Tooltip
              title={<span style={{ fontSize: "2em" }}>{jobStatus.fileName}</span>}
              placement="bottom"
            >
              <TableCell component="th" scope="jobStatus" className={classes.filename}>
                {jobStatus.fileName}
              </TableCell>
            </Tooltip>
            <TableCell align="right">{Types.getName(jobStatus.type)}</TableCell>
            <TableCell align="right">{formatDate(jobStatus.createTime)}</TableCell>
            <TableCell align="right">{formatDate(jobStatus.startTime)}</TableCell>
            <TableCell align="right">{formatDate(jobStatus.endTime)}</TableCell>
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
                  url={`/import/errorfile/?jobUuid=${jobStatus.uuid}`}
                  filename={`errors-${jobStatus.fileName}`}
                  iconProps={{ color: "error" }}
                />
              ) : (
                <div />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const formatDate = date => (isNil(date) ? date : moment(date).format("YYYY-MM-DD HH:mm"));

const mapStateToProps = state => ({
  statuses: state.bulkUpload.statuses,
  viewVersion: state.admin.ui.viewVersion
});

export default withRouter(
  connect(
    mapStateToProps,
    { getStatuses }
  )(Status)
);
