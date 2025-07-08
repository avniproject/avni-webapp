import { Fragment, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { Paper, Typography, Grid, Button } from "@mui/material";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import { getEncounter, getProgramEncounter } from "../../../reducers/viewVisitReducer";
import { withRouter, useHistory } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import Observations from "dataEntryApp/components/Observations";
import { InternalLink } from "../../../../common/components/utils";
import { format, isValid } from "date-fns";
import { useTranslation } from "react-i18next";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";
import { defaultTo } from "lodash";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3, 2),
  margin: theme.spacing(1, 3),
  flexGrow: 1,
  boxShadow: "0px 0px 3px 0px rgba(0,0,0,0.4), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)"
}));

const StyledGrid = styled(Grid)({
  justifyContent: "space-between",
  alignItems: "baseline"
});

const StyledMainHeading = styled(Typography)({
  fontSize: "20px",
  fontWeight: "500",
  marginLeft: 10,
  marginBottom: 10
});

const StyledScheduledHeading = styled(Typography)({
  fontSize: "1vw",
  fontWeight: "300",
  marginBottom: 10
});

const StyledSubHeading = styled(Typography)({
  fontSize: "1vw",
  fontWeight: "bold"
});

const StyledProgramStatus = styled(Typography)(({ theme }) => ({
  backgroundColor: "#54fb36a8",
  fontSize: "12px",
  padding: theme.spacing(0.6, 0.6),
  margin: theme.spacing(1, 1)
}));

const StyledScheduledDateContainer = styled("div")({
  marginBottom: 20,
  marginTop: 10
});

const StyledVisitButton = styled(Button)({
  marginLeft: "8px",
  fontSize: "14px"
});

const ViewVisit = ({ match, getEncounter, getProgramEncounter, encounter, form }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const isViewEncounter = match.path === "/app/subject/viewEncounter";
  let viewAllCompletedUrl;

  if (encounter) {
    viewAllCompletedUrl = isViewEncounter
      ? `/app/subject/completedEncounters?uuid=${encounter.subjectUuid}`
      : `/app/subject/completedProgramEncounters?uuid=${encounter.enrolmentUuid}`;
  }
  useEffect(() => {
    isViewEncounter ? getEncounter(match.queryParams.uuid) : getProgramEncounter(match.queryParams.uuid);
  }, []);

  return encounter ? (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <StyledPaper>
        <StyledGrid container direction="row">
          <StyledMainHeading component="span">{t(defaultTo(encounter.name, encounter.encounterType.name))}</StyledMainHeading>
          {encounter.earliestVisitDateTime ? (
            <StyledScheduledHeading component="span">
              {t("Scheduledon")}:{" "}
              {encounter.earliestVisitDateTime && isValid(new Date(encounter.earliestVisitDateTime))
                ? format(new Date(encounter.earliestVisitDateTime), "dd-MM-yyyy")
                : "-"}
            </StyledScheduledHeading>
          ) : null}
        </StyledGrid>
        <StyledScheduledDateContainer>
          <StyledProgramStatus component="span">{t("Completed")}</StyledProgramStatus>
          <StyledSubHeading component="span">
            {encounter.encounterDateTime && isValid(new Date(encounter.encounterDateTime))
              ? format(new Date(encounter.encounterDateTime), "dd-MM-yyyy")
              : "-"}
          </StyledSubHeading>
        </StyledScheduledDateContainer>
        <Observations observations={encounter ? encounter.observations : []} form={form} />
        <InternalLink to={viewAllCompletedUrl}>
          <StyledVisitButton color="primary">{t("viewAllCompletedVisits")}</StyledVisitButton>
        </InternalLink>
        {/* Re-direct to Dashboard on Back Click*/}
        {/* <InternalLink to={`/app/subject?uuid=${encounter.subjectUuid}`}>
          <Button color="primary" className={classes.visitButton}>
            {t("back")}
          </Button>
        </InternalLink> */}
        <StyledVisitButton color="primary" onClick={history.goBack}>
          {t("back")}
        </StyledVisitButton>
      </StyledPaper>
    </Fragment>
  ) : (
    <CustomizedBackdrop load={false} />
  );
};

const mapStateToProps = state => ({
  encounter: state.dataEntry.viewVisitReducer.encounter,
  form: state.dataEntry.viewVisitReducer.form
});

const mapDispatchToProps = {
  getEncounter,
  getProgramEncounter
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(ViewVisit)
  )
);
