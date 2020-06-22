import React, { Fragment } from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import { makeStyles } from "@material-ui/core/styles";
import { Observation } from "avni-models";
import { ConceptService, i18n } from "../../dataEntryApp/services/ConceptService";
import { useTranslation } from "react-i18next";
import ErrorIcon from "@material-ui/icons/Error";
import PropTypes from "prop-types";

const useStyles = makeStyles(theme => ({
  listItem: {
    paddingBottom: "0px",
    paddingTop: "0px"
  },
  table: {
    borderRadius: "3px",
    boxShadow: "0px 0px 1px"
  },
  abnormalColor: {
    color: "#ff4f33"
  }
}));

const Observations = ({ observations, additionalRows }) => {
  const conceptService = new ConceptService();
  const i = new i18n();
  const { t } = useTranslation();
  const classes = useStyles();

  const rows = observations.map((element, index) => {
    return (
      <TableRow key={index}>
        <TableCell style={{ color: "#555555" }} component="th" scope="row" width="50%">
          {t(element.concept["name"])}
        </TableCell>
        <TableCell align="left" width="50%">
          <div>
            {element.concept && element.concept.datatype === "Coded" ? (
              element.abnormal === true ? (
                <span className={classes.abnormalColor}>
                  {" "}
                  <ErrorIcon /> {t(Observation.valueAsString(element, conceptService, i))}
                </span>
              ) : (
                t(Observation.valueAsString(element, conceptService, i))
              )
            ) : element.concept ? (
              Observation.valueAsString(element, conceptService, i)
            ) : (
              "" + element.value.toLocaleDateString("en-US")
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  });

  additionalRows &&
    additionalRows.forEach((row, index) => {
      rows.unshift(
        <TableRow key={observations.length + index}>
          <TableCell style={{ color: "#555555" }} component="th" scope="row" width="50%">
            {row.label}
          </TableCell>
          <TableCell align="left" width="50%">
            <div>{row.value}</div>
          </TableCell>
        </TableRow>
      );
    });

  return (
    <div>
      <Fragment>
        <Table className={classes.table} size="small" aria-label="a dense table">
          <TableBody>{rows}</TableBody>
        </Table>
      </Fragment>
    </div>
  );
};

Observations.propTypes = {
  observations: PropTypes.arrayOf(Observation).isRequired,
  additionalRows: PropTypes.arrayOf({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired
  })
};

export default Observations;
