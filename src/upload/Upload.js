import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { getStatuses } from "./reducers";
import { get, isNil, map } from "lodash";
import Types from "./Types";
import moment from "moment";
import FileDownloadButton from "../common/components/FileDownloadButton";

const Upload = ({ statuses, getStatuses }) => {
  React.useEffect(() => {
    getStatuses();
  }, []);

  return (
    <Paper>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>File name</TableCell>
            <TableCell align="right">Type</TableCell>
            <TableCell align="right">Created at</TableCell>
            <TableCell align="right">Started at</TableCell>
            <TableCell align="right">Ended at</TableCell>
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
              <TableCell component="th" scope="jobStatus">
                {jobStatus.fileName}
              </TableCell>
              <TableCell align="right">{Types[jobStatus.type]}</TableCell>
              <TableCell align="right">{formatDate(jobStatus.createTime)}</TableCell>
              <TableCell align="right">{formatDate(jobStatus.startTime)}</TableCell>
              <TableCell align="right">{formatDate(jobStatus.endTime)}</TableCell>
              <TableCell align="right">{jobStatus.status}</TableCell>
              <TableCell align="right">{jobStatus.total}</TableCell>
              <TableCell align="right">{jobStatus.completed}</TableCell>
              <TableCell align="right">{jobStatus.skipped}</TableCell>
              <TableCell align="right">
                {["COMPLETED", "FAILED"].includes(jobStatus.status) && (
                  <FileDownloadButton
                    url={`/import/errorfile/?jobUuid=${jobStatus.uuid}`}
                    filename={`errors-${jobStatus.fileName}`}
                    iconStyle={{ fill: "red" }}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

const formatDate = date => (isNil(date) ? date : moment(date).format("YYYY-MM-DD HH:mm"));

const mapStateToProps = state => ({
  statuses: state.bulkUpload.statuses
});

export default withRouter(
  connect(
    mapStateToProps,
    { getStatuses }
  )(Upload)
);
