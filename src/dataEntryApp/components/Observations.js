import React from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import { makeStyles } from "@material-ui/core/styles";
import { Observation } from "avni-models";
import { ConceptService, i18n } from "../services/ConceptService";
import { useTranslation } from "react-i18next";
import ErrorIcon from "@material-ui/icons/Error";
import PropTypes from "prop-types";
import { isEmpty, isNil } from "lodash";
import useCommonStyles from "dataEntryApp/styles/commonStyles";
import clsx from "clsx";
import Colors from "dataEntryApp/Colors";

const useStyles = makeStyles(theme => ({
  listItem: {
    paddingBottom: "0px",
    paddingTop: "0px"
  },
  abnormalColor: {
    color: "#ff4f33"
  },
  highlightBackground: {
    backgroundColor: Colors.HighlightBackgroundColor
  }
}));

const Observations = ({ observations, additionalRows, form, customKey, highlight }) => {
  const conceptService = new ConceptService();
  const i = new i18n();
  const { t } = useTranslation();
  const classes = useStyles();
  const commonStyles = useCommonStyles();

  if (isNil(observations)) {
    return <div />;
  }

  const renderValue = (value, isAbnormal) => {
    return isAbnormal ? (
      <span className={classes.abnormalColor}>
        {" "}
        <ErrorIcon /> {value}
      </span>
    ) : (
      value
    );
  };

  const orderedObs = isNil(form) ? observations : form.orderObservations(observations);

  const rows = orderedObs.map((obs, index) => {
    return (
      <TableRow key={`${index}-${customKey}`}>
        <TableCell style={{ color: "#555555" }} component="th" scope="row" width="50%">
          {t(obs.concept["name"])}
        </TableCell>
        <TableCell align="left" width="50%">
          <div>
            {renderValue(t(Observation.valueAsString(obs, conceptService, i)), obs.isAbnormal())}
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
            {t(row.label)}
          </TableCell>
          <TableCell align="left" width="50%">
            <div>{renderValue(t(row.value), row.abnormal)}</div>
          </TableCell>
        </TableRow>
      );
    });

  return isEmpty(rows) ? (
    <div />
  ) : (
    <div>
      <Table
        className={clsx(commonStyles.tableContainer, highlight && classes.highlightBackground)}
        size="small"
        aria-label="a dense table"
      >
        <TableBody>{rows}</TableBody>
      </Table>
    </div>
  );
};

Observations.propTypes = {
  observations: PropTypes.arrayOf(Observation).isRequired,
  additionalRows: PropTypes.arrayOf({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    abnormal: PropTypes.bool
  }),
  highlight: PropTypes.bool
};

export default Observations;
