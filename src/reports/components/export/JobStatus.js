import { connect } from "react-redux";
import { getUploadStatuses } from "../../reducers";
import { withRouter } from "react-router-dom";
import React from "react";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import { find, get, isNil, map } from "lodash";
import moment from "moment";
import http from "common/utils/httpClient";
import fileDownload from "js-file-download";
import Box from "@material-ui/core/Box";
import { Grid, makeStyles } from "@material-ui/core";
import Refresh from "@material-ui/icons/Refresh";
import TablePagination from "@material-ui/core/TablePagination";
import Button from "@material-ui/core/Button";
import CloudDownload from "@material-ui/icons/CloudDownload";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    marginTop: theme.spacing.unit * 3,
    overflowX: "hide"
  },
  table: {
    minWidth: 340
  },
  tableHeader: {
    paddingRight: 4,
    paddingLeft: 5,
    fontWeight: "bold"
  },
  tableRow: {
    paddingRight: 4,
    paddingLeft: 5
  }
}));

const JobStatus = ({
  exportJobStatuses,
  getUploadStatuses,
  operationalModules: { subjectTypes, programs, encounterTypes }
}) => {
  React.useEffect(() => {
    getUploadStatuses(0);
  }, []);
  const classes = useStyles();
  const rowsPerPage = 10;
  const [page, setPage] = React.useState(0);

  const formatDate = date => (isNil(date) ? date : moment(date).format("YYYY-MM-DD HH:mm"));
  const IsoDateFormat = date => (isNil(date) ? date : moment(date).format("YYYY-MM-DD"));
  const getDateParams = ({ startDate, endDate }) =>
    isNil(startDate) || isNil(endDate)
      ? ""
      : `${IsoDateFormat(startDate)} to ${IsoDateFormat(endDate)}`;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    getUploadStatuses(newPage);
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
      findEntityByUUID(encounterTypes, encounterTypeUUID).operationalEncounterTypeName,
      IsoDateFormat(startDate),
      IsoDateFormat(endDate)
    ]
      .filter(Boolean)
      .join("_");
    http
      .get(`/export/download?fileName=${fileName}`, {
        responseType: "blob"
      })
      .then(response => {
        fileDownload(response.data, `${outFileName}.csv`);
      })
      .catch(error => alert(`${error.message} Error occurred while downloading file`));
  };

  return (
    <Box>
      <Grid container direction="row" justify="flex-end">
        <Button color="primary" onClick={() => getUploadStatuses(0)}>
          <Refresh />
          {" Refresh"}
        </Button>
      </Grid>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell className={classes.tableHeader}>Report Type</TableCell>
            <TableCell className={classes.tableHeader}>Subject type</TableCell>
            <TableCell className={classes.tableHeader}>Program</TableCell>
            <TableCell className={classes.tableHeader}>Encounter type</TableCell>
            <TableCell className={classes.tableHeader}>Date range</TableCell>
            <TableCell className={classes.tableHeader}>Ended at</TableCell>
            <TableCell className={classes.tableHeader}>Status</TableCell>
            <TableCell className={classes.tableHeader}>Download</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {map(get(exportJobStatuses, "content"), status => (
            <TableRow key={status.uuid}>
              <TableCell className={classes.tableRow}>{status.reportType}</TableCell>
              <TableCell className={classes.tableRow}>
                {findEntityByUUID(subjectTypes, status.subjectTypeUUID).name}
              </TableCell>
              <TableCell className={classes.tableRow}>
                {findEntityByUUID(programs, status.programUUID).operationalProgramName}
              </TableCell>
              <TableCell className={classes.tableRow}>
                {
                  findEntityByUUID(encounterTypes, status.encounterTypeUUID)
                    .operationalEncounterTypeName
                }
              </TableCell>
              <TableCell className={classes.tableRow}>{getDateParams(status)}</TableCell>
              <TableCell className={classes.tableRow}>{formatDate(status.endTime)}</TableCell>
              <TableCell className={classes.tableRow}>{status.status}</TableCell>
              <TableCell className={classes.tableRow}>
                <Button
                  color="primary"
                  onClick={() => onDownloadHandler(status)}
                  disabled={status.status !== "COMPLETED"}
                >
                  <CloudDownload disabled={status.status !== "COMPLETED"} />
                  {" Download"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[10]}
        component="div"
        count={get(exportJobStatuses, "totalElements") || 0}
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
