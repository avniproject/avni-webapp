import { connect } from "react-redux";
import { getUploadStatuses } from "./reducers";
import { withRouter } from "react-router-dom";
import React from "react";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import { get, isNil, map } from "lodash";
import moment from "moment";
import axios from "axios";
import fileDownload from "js-file-download";
import Box from "@material-ui/core/Box";
import { Grid } from "@material-ui/core";
import Refresh from "@material-ui/icons/Refresh";
import IconButton from "@material-ui/core/IconButton";
import TablePagination from "@material-ui/core/TablePagination";

const JobStatus = ({ exportJobStatuses, getUploadStatuses }) => {
  React.useEffect(() => {
    getUploadStatuses(0);
  }, []);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [page, setPage] = React.useState(0);
  const formatDate = date => (isNil(date) ? date : moment(date).format("YYYY-MM-DD HH:mm"));

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    getUploadStatuses(newPage);
  };

  const onDownloadHandler = fileName => {
    axios
      .get(`/export/download?fileName=${fileName}`, {
        responseType: "blob"
      })
      .then(response => {
        fileDownload(response.data, fileName);
      })
      .catch(error => alert("Error occurred while downloading file"));
  };

  const downloadableFile = fileName => {
    return (
      <span
        style={{ cursor: "pointer", color: "blue", textDecorationLine: "underline" }}
        onClick={() => onDownloadHandler(fileName)}
      >
        {fileName}
      </span>
    );
  };

  const parseParams = status => {
    return `{Subject:${status.subjectTypeName}, Program:${status.programName}, EncounterType:${
      status.encounterTypeName
    },
     Range:(${status.startDateParam} to ${status.endDateParam})}`;
  };

  return (
    <Box>
      <Grid container direction="row" justify="flex-end">
        <IconButton color="primary" aria-label="refresh" onClick={() => getUploadStatuses()}>
          <Refresh />
        </IconButton>
      </Grid>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Params</TableCell>
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
            <TableCell align="right">File name</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {map(get(exportJobStatuses, "_embedded.exportJobStatuses"), status => (
            <TableRow key={status.uuid}>
              <TableCell>{parseParams(status)}</TableCell>
              <TableCell align="right">{formatDate(status.createTime)}</TableCell>
              <TableCell align="right">{formatDate(status.startTime)}</TableCell>
              <TableCell align="right">{formatDate(status.endTime)}</TableCell>
              <TableCell align="right">{status.status}</TableCell>
              <TableCell align="right">
                {status.status === "COMPLETED"
                  ? downloadableFile(status.fileName)
                  : status.fileName}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[10]}
        component="div"
        count={get(exportJobStatuses, "page.totalElements")}
        rowsPerPage={rowsPerPage}
        page={page}
        backIconButtonProps={{ "aria-label": "previous page" }}
        nextIconButtonProps={{ "aria-label": "next page" }}
        onChangePage={handleChangePage}
      />
    </Box>
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
