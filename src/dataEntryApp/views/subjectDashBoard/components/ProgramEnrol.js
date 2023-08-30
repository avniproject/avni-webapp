import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import {
  onLoad,
  setProgramEnrolment,
  fetchEnrolmentRulesResponse,
  setEnrolmentDate,
  setExitDate
} from "dataEntryApp/reducers/programEnrolReducer";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import { getSubjectProfile } from "../../../reducers/subjectDashboardReducer";
import ProgramEnrolmentForm from "./ProgramEnrolmentForm";
import ProgramExitEnrolmentForm from "./ProgramExitEnrolmentForm";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";
import { DateFormElement } from "dataEntryApp/components/DateFormElement";
import { ProgramEnrolment } from "openchs-models";
import StaticFormElement from "dataEntryApp/views/viewmodel/StaticFormElement";
import { useTranslation } from "react-i18next";
import { LineBreak } from "../../../../common/components/utils";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
    margin: theme.spacing(1, 3),
    flexGrow: 1
  },
  mainHeading: {
    fontSize: "20px"
  },
  btnCustom: {
    backgroundColor: "#fc9153",
    height: "30px",
    marginRight: "20px"
  },
  container: {
    display: "inline",
    flexWrap: "wrap",
    fontSize: "13px"
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
    display: "inline",
    fontSize: "13px"
  },
  input: {
    fontSize: "13px"
  }
}));

const ProgramEnrol = ({
  match,
  onLoad,
  enrolForm,
  getSubjectProfile,
  programEnrolment,
  load,
  validationResults,
  setEnrolmentDate,
  setExitDate
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const formType = match.queryParams.formType;
  const subjectTypeName = match.queryParams.subjectTypeName;
  useEffect(() => {
    onLoad(
      subjectTypeName,
      match.queryParams.programName,
      formType,
      match.queryParams.programEnrolmentUuid,
      match.queryParams.uuid
    );
  }, []);

  return load ? (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <Paper className={classes.root}>
        <div className={classes.tableView}>
          <Typography component={"span"} className={classes.mainHeading}>
            {t(match.queryParams.programName)}
          </Typography>
          <Grid justifyContent="center" alignItems="center" container spacing={3}>
            <Grid item xs={12}>
              {enrolForm && programEnrolment && formType === "ProgramEnrolment" ? (
                <ProgramEnrolmentForm
                  formType={formType}
                  fetchRulesResponse={fetchEnrolmentRulesResponse}
                >
                  <DateFormElement
                    uuid={ProgramEnrolment.validationKeys.ENROLMENT_DATE}
                    formElement={new StaticFormElement("Enrolment Date", true, true)}
                    value={programEnrolment.enrolmentDateTime}
                    validationResults={validationResults}
                    update={setEnrolmentDate}
                  />
                  <LineBreak num={3} />
                </ProgramEnrolmentForm>
              ) : enrolForm && programEnrolment && formType === "ProgramExit" ? (
                <ProgramExitEnrolmentForm
                  formType={formType}
                  fetchRulesResponse={fetchEnrolmentRulesResponse}
                >
                  <DateFormElement
                    uuid={ProgramEnrolment.validationKeys.EXIT_DATE}
                    formElement={new StaticFormElement("Exit Enrolment Date", true, true)}
                    value={programEnrolment.programExitDateTime}
                    validationResults={validationResults}
                    update={setExitDate}
                  />
                  <LineBreak num={3} />
                </ProgramExitEnrolmentForm>
              ) : (
                <div>Loading</div>
              )}
            </Grid>
          </Grid>
        </div>
      </Paper>
    </Fragment>
  ) : (
    <CustomizedBackdrop load={load} />
  );
};

const mapStateToProps = state => ({
  enrolForm: state.dataEntry.enrolmentReducer.enrolForm,
  subjectProfile: state.dataEntry.subjectProfile.subjectProfile,
  programEnrolment: state.dataEntry.enrolmentReducer.programEnrolment,
  load: state.dataEntry.enrolmentReducer.load,
  validationResults: state.dataEntry.enrolmentReducer.validationResults
});

const mapDispatchToProps = {
  onLoad,
  getSubjectProfile,
  setProgramEnrolment,
  setEnrolmentDate,
  setExitDate
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(ProgramEnrol)
  )
);
