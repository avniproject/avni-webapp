import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import { getProgramEnrolment, getProgramEncounter } from "../../../reducers/programReducer";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableHead, TableCell, TableRow, Typography } from "@material-ui/core";
import { LineBreak } from "../../../../common/components/utils";
const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
    margin: theme.spacing(1, 3),
    flexGrow: 1
  }
}));

const NewProgramVisit = ({ match, ...props }) => {
  const { t } = useTranslation();

  const classes = useStyles();

  useEffect(() => {
    console.log("Heloo I am at program visit");
    props.getProgramEnrolment(match.queryParams.uuid);
    props.getProgramEncounter("Individual", props.program.uuid);

    // (async function fetchData() {
    //   await onLoad("Individual", match.queryParams.programName);
    //   getSubjectProfile(match.queryParams.uuid);

    //   // let programEnrolment = BrowserStore.fetchProgramEnrolment();
    //   // setProgramEnrolment(programEnrolment);
    // })();
  }, []);
  console.log("program", props.program);
  console.log("plannedVisits", props.plannedEncounters);

  return (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <Paper className={classes.root}>
        {/* <Typography variant="button" display="block" gutterBottom>
          New program visit
        </Typography>
        <LineBreak num={1}/>
        {plannedEncounters ? (
            <Paper>
                <Typography gutterBottom>
                  Planned visits 
                </Typography>                
                <Table className={classes.table} size="small" aria-label="a dense table" >
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("Name")}</TableCell>
                      <TableCell>{t("Date")}</TableCell>
                    </TableRow>
                  </TableHead>    
                  <TableBody>
                  {plannedEncounters.map(visit => (
                    <TableRow>
                      <TableCell
                        style={{ color: "#555555" }}
                        component="th"
                        scope="row"
                        width="50%"
                      >
                        {visit.name}
                      </TableCell>
                      <TableCell align="left" width="50%">
                        <div>visit.date</div>
                      </TableCell>
                    </TableRow>
                  ))}
                  </TableBody>
                </Table>
              </Paper>
        ) : (
          <div>
            <p>no visits panned</p>
          </div>
        )} */}
      </Paper>
    </Fragment>
  );
};

const mapStateToProps = state => ({
  //   enrolForm: state.dataEntry.enrolmentReducer.enrolForm,
  //   subjectProfile: state.dataEntry.subjectProfile.subjectProfile,
  //   programEnrolment: state.dataEntry.enrolmentReducer.programEnrolment
  plannedEncounters: state.programs.programEnrolment
    ? state.programs.programEnrolment.programEncounters
    : [],
  program: state.programs.programEnrolment ? state.programs.programEnrolment.program : {},
  x: state
});

const mapDispatchToProps = {
  getProgramEnrolment,
  getProgramEncounter
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
