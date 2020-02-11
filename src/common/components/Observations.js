import React, { Fragment } from "react";
import moment from "moment/moment";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import { makeStyles } from "@material-ui/core/styles";
import ErrorIcon from "@material-ui/icons/Error";

const useStyles = makeStyles(theme => ({
  listItem: {
    paddingBottom: "0px",
    paddingTop: "0px"
  },
  table: {
    border: "1px solid rgba(224, 224, 224, 1)"
  },
  abnormalColor: {
    color: "#ff4f33"
  }
}));

const Observations = ({ observations }) => {
  const classes = useStyles();
  return (
    <div>
      {observations
        ? observations.map((element, index) => {
            return (
              <Fragment key={index}>
                <Table className={classes.table} size="small" aria-label="a dense table">
                  <TableBody>
                    <TableRow>
                      <TableCell
                        style={{ color: "#555555" }}
                        component="th"
                        scope="row"
                        width="50%"
                      >
                        {element.concept["name"]}
                      </TableCell>
                      <TableCell align="left" width="50%">
                        {"Coded" === element.concept.dataType ? (
                          <div>
                            {element.value
                              .map(it =>
                                it.abnormal ? (
                                  <span className={classes.abnormalColor}>
                                    <ErrorIcon fontSize="small" />
                                    {it.name}
                                  </span>
                                ) : (
                                  <span>{it.name}</span>
                                )
                              )
                              .reduce((prev, curr) => [prev, ", ", curr])}
                          </div>
                        ) : ["Date", "DateTime", "Time", "Duration"].includes(
                            element.concept.dataType
                          ) ? (
                          <div>{moment(new Date(element.value)).format("DD-MM-YYYY HH:MM A")}</div>
                        ) : (
                          <div>{element.value}</div>
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Fragment>
            );
          })
        : ""}
    </div>
  );
};

export default Observations;
