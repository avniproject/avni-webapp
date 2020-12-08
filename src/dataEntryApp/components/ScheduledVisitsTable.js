import React from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import useCommonStyles from "dataEntryApp/styles/commonStyles";
import moment from "moment";
import { makeStyles } from "@material-ui/core/styles";
import Colors from "../Colors";

const useStyles = makeStyles(theme => ({
  highlightBackground: {
    backgroundColor: Colors.HighlightBackgroundColor
  }
}));

const ScheduledVisitsTable = ({ visitSchedules }) => {
  const commonStyles = useCommonStyles();
  const classes = useStyles();

  return (
    <Table
      className={`${commonStyles.tableContainer} ${classes.highlightBackground}`}
      aria-label="caption table"
    >
      <TableHead>
        <TableRow>
          <TableCell align="left">Visit Name</TableCell>
          <TableCell align="left">Scheduling for</TableCell>
          <TableCell align="left">Overdue after</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {visitSchedules.map(row => (
          <TableRow key={row.name}>
            <TableCell align="left" component="th" scope="row">
              {row.name}
            </TableCell>
            <TableCell align="left">{moment(row.earliestDate).format("DD-MM-YYYY")}</TableCell>
            <TableCell align="left">{moment(row.maxDate).format("DD-MM-YYYY")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ScheduledVisitsTable;
