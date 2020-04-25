import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import { getProgramPlannedVisits } from "../../../reducers/programReducer";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import { useTranslation } from "react-i18next";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
    margin: theme.spacing(1, 3),
    flexGrow: 1
  }
}));

const NewProgramVisit = ({ match, getProgramPlannedVisits, programPlannedVisits }) => {
  const { t } = useTranslation();

  const classes = useStyles();

  useEffect(() => {
    console.log("Heloo I am at program visit");
    getProgramPlannedVisits(match.queryParams.uuid);

    // (async function fetchData() {
    //   await onLoad("Individual", match.queryParams.programName);
    //   getSubjectProfile(match.queryParams.uuid);

    //   // let programEnrolment = BrowserStore.fetchProgramEnrolment();
    //   // setProgramEnrolment(programEnrolment);
    // })();
  }, []);

  return (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <Paper className={classes.root}>
        <div>Loading</div>
        {programPlannedVisits ? (
          programPlannedVisits.map((visit, index) => {
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
                        visit.name
                      </TableCell>
                      <TableCell align="left" width="50%">
                        <div>visit.name</div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Fragment>
            );
          })
        ) : (
          <div>
            <p>no visits panned</p>
          </div>
        )}
      </Paper>
    </Fragment>
  );
};

const mapStateToProps = state => ({
  //   enrolForm: state.dataEntry.enrolmentReducer.enrolForm,
  //   subjectProfile: state.dataEntry.subjectProfile.subjectProfile,
  //   programEnrolment: state.dataEntry.enrolmentReducer.programEnrolment
  programPlannedVisits: state.programPlannedVisits
});

const mapDispatchToProps = {
  getProgramPlannedVisits
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(NewProgramVisit)
  )
);

// const mapStateToProps = state => ({
//   validationResults: state.dataEntry.registration.validationResults
// });

// const mapDispatchToProps = {
//   setValidationResults
// };

// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(NewProgramVisit);
