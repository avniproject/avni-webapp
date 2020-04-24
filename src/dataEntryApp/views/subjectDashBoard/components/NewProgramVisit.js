import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import { getProgramVisits } from "../../../reducers/programReducer";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
    margin: theme.spacing(1, 3),
    flexGrow: 1
  }
}));

const NewProgramVisit = ({ match, getProgramVisits }) => {
  const { t } = useTranslation();

  const classes = useStyles();

  useEffect(() => {
    console.log("Heloo I am at program visit");
    getProgramVisits();

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
      </Paper>
    </Fragment>
  );
};

const mapStateToProps = state => ({
  //   enrolForm: state.dataEntry.enrolmentReducer.enrolForm,
  //   subjectProfile: state.dataEntry.subjectProfile.subjectProfile,
  //   programEnrolment: state.dataEntry.enrolmentReducer.programEnrolment
});

const mapDispatchToProps = {
  getProgramVisits
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(NewProgramVisit)
  )
);
