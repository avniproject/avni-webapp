import { Fragment, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { Paper, Typography, Grid } from "@mui/material";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import {
  onLoad,
  setProgramEnrolment,
  fetchEnrolmentRulesResponse,
  setEnrolmentDate,
  setExitDate
} from "dataEntryApp/reducers/programEnrolReducer";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useSearchParams } from "react-router-dom";
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

const ProgramEnrol = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const enrolForm = useSelector(state => state.dataEntry.enrolmentReducer.enrolForm);
  const subjectProfile = useSelector(state => state.dataEntry.subjectProfile.subjectProfile);
  const programEnrolment = useSelector(state => state.dataEntry.enrolmentReducer.programEnrolment);
  const load = useSelector(state => state.dataEntry.enrolmentReducer.load);
  const validationResults = useSelector(state => state.dataEntry.enrolmentReducer.validationResults);

  const formType = searchParams.get("formType");
  const subjectTypeName = searchParams.get("subjectTypeName");
  const programName = searchParams.get("programName");
  const programEnrolmentUuid = searchParams.get("programEnrolmentUuid");
  const uuid = searchParams.get("uuid");

  useEffect(() => {
    dispatch(onLoad(subjectTypeName, programName, formType, programEnrolmentUuid, uuid));
  }, [dispatch, subjectTypeName, programName, formType, programEnrolmentUuid, uuid]);

  return load ? (
    <Fragment>
      <Breadcrumbs path={location.pathname} />
      <StyledPaper>
        <StyledTypography component="span">{t(programName)}</StyledTypography>
        <StyledGrid size={12}>
          {enrolForm && programEnrolment && formType === "ProgramEnrolment" ? (
            <ProgramEnrolmentForm formType={formType} fetchRulesResponse={fetchEnrolmentRulesResponse}>
              <DateFormElement
                uuid={ProgramEnrolment.validationKeys.ENROLMENT_DATE}
                formElement={new StaticFormElement("Enrolment Date", true, true)}
                value={programEnrolment.enrolmentDateTime}
                validationResults={validationResults}
                update={value => dispatch(setEnrolmentDate(value))}
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
                update={value => dispatch(setExitDate(value))}
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

export default ProgramEnrol;
