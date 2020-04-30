import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import { useTranslation } from "react-i18next";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import _ from "lodash";
import { Table, TableBody, TableHead, TableCell, TableRow, Typography } from "@material-ui/core";
import { LineBreak, InternalLink } from "../../../../common/components/utils";
import { ModelGeneral as General } from "avni-models";
import NewProgramVisitMenuItem from "./NewProgramVisitMenuItem";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
    margin: theme.spacing(1, 3),
    flexGrow: 1
  },
  tableHeader: {
    // fontSize: "12px",
    // // fontFamily: "Roboto Reg",
    // fontWeight: 500,
    color: "black"
  }
}));

const NewProgramVisitMenuView = ({ sections, enrolmentUuid, formMappings }) => {
  const { t } = useTranslation();

  const classes = useStyles();

  console.log("Innn NewProgramVisitMenuView", sections);
  return (
    <Fragment>
      {/* <Paper className={classes.root}> */}
      {sections
        ? sections.map(section => (
            <div>
              <Paper className={classes.root}>
                <Typography gutterBottom>{section.title}</Typography>

                <Paper>
                  <Table className={classes.table} size="small" aria-label="a dense table">
                    <TableHead>
                      <TableRow>
                        <TableCell className={classes.tableHeader}>{t("Name")}</TableCell>
                        {_.isEqual(section.title, t("plannedVisits")) ? (
                          <TableCell className={classes.tableHeader}>{t("Date")}</TableCell>
                        ) : (
                          <TableCell />
                        )}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {section.data
                        .filter(e => !_.isNil(e.encounterType))
                        .map(encounter => (
                          <TableRow>
                            {encounter.encounterType ? (
                              <TableCell
                                style={{ color: "#555555" }}
                                component="th"
                                scope="row"
                                width="50%"
                              >
                                <InternalLink
                                  to={`/app/subject/programEncounter?uuid=${
                                    encounter.encounterType.uuid
                                  }&enrolUuid=${enrolmentUuid}`}
                                  encounter={encounter}
                                >
                                  {encounter.encounterType.name}
                                </InternalLink>
                              </TableCell>
                            ) : (
                              ""
                            )}

                            <TableCell align="left" width="50%">
                              {/* {plannedEncounter.earliestVisitDateTime} */}
                              {encounter.earliestVisitDateTime &&
                                General.toDisplayDate(encounter.earliestVisitDateTime)}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Paper>
              <LineBreak num={1} />
            </div>
          ))
        : ""}
      {/* </Paper> */}
    </Fragment>
  );
};

const mapStateToProps = state => ({
  formMappings: state.dataEntry.metadata.operationalModules.formMappings
});

const mapDispatchToProps = {
  // getProgramEnrolment,
  // getProgramEncounter
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(NewProgramVisitMenuView)
  )
);
