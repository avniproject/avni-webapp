import { Fragment, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { Paper, Typography, Grid, Button } from "@mui/material";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import {
  getEncounter,
  getProgramEncounter
} from "../../../reducers/viewVisitReducer";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
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
  boxShadow:
    "0px 0px 3px 0px rgba(0,0,0,0.4), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)"
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

const ViewVisit = () => {
  // Use Redux hooks instead of connect()
  const dispatch = useDispatch();
  const encounter = useSelector(
    state => state.dataEntry.viewVisitReducer.encounter
  );
  const form = useSelector(state => state.dataEntry.viewVisitReducer.form);

  const navigate = useNavigate();
  const location = useLocation();

  const { t } = useTranslation();

  const goBack = () => navigate(-1);

  const searchParams = new URLSearchParams(location.search);
  const uuid = searchParams.get("uuid");

  const isViewEncounter = location.pathname.includes("/viewEncounter");
  let viewAllCompletedUrl;

  if (encounter) {
    viewAllCompletedUrl = isViewEncounter
      ? `/app/subject/completedEncounters?uuid=${encounter.subjectUuid}`
      : `/app/subject/completedProgramEncounters?uuid=${
          encounter.enrolmentUuid
        }`;
  }

  useEffect(() => {
    if (uuid) {
      if (isViewEncounter) {
        dispatch(getEncounter(uuid));
      } else {
        dispatch(getProgramEncounter(uuid));
      }
    }
  }, [dispatch, isViewEncounter, uuid]);

  return encounter ? (
    <Fragment>
      <Breadcrumbs path={location.pathname} />
      <StyledPaper>
        <StyledGrid container direction="row">
          <StyledMainHeading component="span">
            {t(defaultTo(encounter.name, encounter.encounterType.name))}
          </StyledMainHeading>
          {encounter.earliestVisitDateTime ? (
            <StyledScheduledHeading component="span">
              {t("Scheduledon")}:{" "}
              {encounter.earliestVisitDateTime &&
              isValid(new Date(encounter.earliestVisitDateTime))
                ? format(
                    new Date(encounter.earliestVisitDateTime),
                    "dd-MM-yyyy"
                  )
                : "-"}
            </StyledScheduledHeading>
          ) : null}
        </StyledGrid>
        <StyledScheduledDateContainer>
          <StyledProgramStatus component="span">
            {t("Completed")}
          </StyledProgramStatus>
          <StyledSubHeading component="span">
            {encounter.encounterDateTime &&
            isValid(new Date(encounter.encounterDateTime))
              ? format(new Date(encounter.encounterDateTime), "dd-MM-yyyy")
              : "-"}
          </StyledSubHeading>
        </StyledScheduledDateContainer>
        <Observations
          observations={encounter ? encounter.observations : []}
          form={form}
        />
        <InternalLink to={viewAllCompletedUrl}>
          <StyledVisitButton color="primary">
            {t("viewAllCompletedVisits")}
          </StyledVisitButton>
        </InternalLink>
        {/* Re-direct to Dashboard on Back Click*/}
        {/* <InternalLink to={`/app/subject?uuid=${encounter.subjectUuid}`}>
          <Button color="primary" className={classes.visitButton}>
            {t("back")}
          </Button>
        </InternalLink> */}
        <StyledVisitButton color="primary" onClick={goBack}>
          {t("back")}
        </StyledVisitButton>
      </StyledPaper>
    </Fragment>
  ) : (
    <CustomizedBackdrop load={false} />
  );
};

export default ViewVisit;
