import React, { Fragment } from "react";
import moment from "moment/moment";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import { makeStyles } from "@material-ui/core/styles";
import ErrorIcon from "@material-ui/icons/Error";

import { Concept, Observation } from "avni-models";
import _ from "lodash";
import { ConceptService, i18n } from "../../dataEntryApp/services/ConceptService";
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
  const valueAsString = (observation, conceptService, i18n) => {
    const valueWrapper = observation.getValueWrapper();

    if (
      observation.concept.datatype === Concept.dataType.Date ||
      observation.concept.datatype === Concept.dataType.DateTime
    ) {
      return valueWrapper.asDisplayDate();
    } else if (observation.concept.datatype === Concept.dataType.Time) {
      return valueWrapper.asDisplayTime();
    } else if (valueWrapper.isSingleCoded) {
      return i18n.t(conceptService.getConceptByUUID(valueWrapper.getConceptUUID()).name);
    } else if (valueWrapper.isMultipleCoded) {
      return _.join(
        valueWrapper.getValue().map(value => {
          return i18n.t(conceptService.getConceptByUUID(value).name);
        }),
        ", "
      );
    } else if (observation.concept.isDurationConcept()) {
      return _.toString(valueWrapper.toString(i18n));
    } else {
      const unit = _.defaultTo(observation.concept.unit, "");
      return _.toString(`${valueWrapper.getValue()} ${unit}`);
    }
  };

  const conceptService = new ConceptService();
  const i = new i18n();

  //debugger
  //const orderedObservation = observations.map(obs => valueAsString(obs, conceptService, null));

  // console.log(orderedObservation);

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
                      <TableCell component="th" scope="row" width="50%">
                        {element.concept["name"]}
                      </TableCell>
                      {/* <TableCell align="left" width="50%">
                        {"Coded" === element.concept.dataType ? (
                          <div>
                            {element.valueJSON
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
                          <div>{moment(new Date(element.valueJSON)).format("DD-MM-YYYY HH:MM A")}</div>
                        ) : (
                          <div>{element.valueJSON}</div>
                        )}
                      </TableCell> */}
                      <TableCell align="left" width="50%">
                        <div>{valueAsString(element, conceptService, i)} </div>
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
