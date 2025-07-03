import React, { Fragment, useEffect } from "react";
import { styled } from '@mui/material/styles';
import { Paper, Typography, Grid } from "@mui/material";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
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

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3, 2),
  margin: theme.spacing(1, 3),
  flexGrow: 1
}));

const StyledTypography = styled(Typography)({
  fontSize: "20px"
});

const StyledGrid = styled(Grid)(({ theme }) => ({
  container: true,
  spacing: theme.spacing(3),
  justifyContent: "center",
  alignItems: "center"
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
  const { t } = useTranslation();
  const formType = match.queryParams.formType;
  const subjectTypeName = match.queryParams.subjectTypeName;

  useEffect(() => {
    onLoad(subjectTypeName, match.queryParams.programName, formType, match.queryParams.programEnrolmentUuid, match.queryParams.uuid);
  }, []);

  return load ? (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <StyledPaper>
        <StyledTypography component="span">{t(match.queryParams.programName)}</StyledTypography>
        <StyledGrid size={12}>
          {enrolForm && programEnrolment && formType === "ProgramEnrolment" ? (
            <ProgramEnrolmentForm formType={formType} fetchRulesResponse={fetchEnrolmentRulesResponse}>
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
            <ProgramExitEnrolmentForm formType={formType} fetchRulesResponse={fetchEnrolmentRulesResponse}>
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
        </StyledGrid>
      </StyledPaper>
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