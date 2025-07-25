import { useState } from "react";
import { styled } from "@mui/material/styles";
import {
  Box,
  Paper,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import _, { filter, isEmpty, isNil } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import SubjectVoided from "../../../components/SubjectVoided";
import PlannedVisitsTable from "../PlannedVisitsTable";
import {
  clearVoidServerError,
  voidGeneralEncounter
} from "../../../reducers/subjectDashboardReducer";
import CompletedVisits from "./CompletedVisits";
import { NewGeneralEncounterButton } from "./NewGeneralEncounterButton";
import ConfirmDialog from "../../../components/ConfirmDialog";
import MessageDialog from "../../../components/MessageDialog";

const StyledPaper = styled(Paper)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(2),
  boxShadow: "0px 0px 4px 1px rgba(0,0,0,0.3)"
}));

const StyledBox = styled(Box)({
  flexGrow: 1
});

const StyledAccordion = styled(Accordion)({
  marginBottom: "11px",
  borderRadius: "5px",
  boxShadow:
    "0px 0px 3px 1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)"
});

const StyledAccordionSummary = styled(AccordionSummary)({});

const StyledAccordionDetails = styled(AccordionDetails)({
  padding: 0,
  display: "block"
});

const StyledTypography = styled(Typography)({
  fontSize: "1rem",
  flexBasis: "33.33%",
  flexShrink: 0,
  fontWeight: "500"
});

const StyledExpandMore = styled(ExpandMore)({
  color: "#0e6eff"
});

const SubjectDashboardGeneralTab = ({
  general,
  subjectUuid,
  subjectTypeUuid,
  subjectVoided,
  displayGeneralInfoInProfileTab
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Use useSelector to get state from Redux store
  const voidError = useSelector(state => state.subjectDashboard?.voidError);

  const [isExpanded, setIsExpanded] = useState(false);
  const [
    plannedEncounterUUIDToBeVoided,
    setPlannedEncounterUUIDToBeVoided
  ] = useState("");

  // Action dispatchers using useDispatch hook
  const handleVoidGeneralEncounter = encounterUuid => {
    dispatch(voidGeneralEncounter(encounterUuid));
  };

  const handleClearVoidServerError = () => {
    dispatch(clearVoidServerError());
  };

  const plannedVisits = filter(
    general,
    ({ voided, encounterDateTime, cancelDateTime }) =>
      !voided && isNil(encounterDateTime) && isNil(cancelDateTime)
  );
  const ContainerComponent = displayGeneralInfoInProfileTab
    ? StyledBox
    : StyledPaper;

  return (
    <ContainerComponent>
      {subjectVoided && <SubjectVoided showUnVoid={false} />}
      {!subjectVoided && !displayGeneralInfoInProfileTab && (
        <NewGeneralEncounterButton subjectUuid={subjectUuid} />
      )}
      <StyledAccordion>
        <StyledAccordionSummary
          expandIcon={<StyledExpandMore />}
          aria-controls="plannedVisitPanelbh-content"
          id="planned-general-encounter-details"
        >
          <StyledTypography component="span">
            {t("plannedVisits")}
          </StyledTypography>
        </StyledAccordionSummary>
        <StyledAccordionDetails>
          <PlannedVisitsTable
            plannedVisits={plannedVisits || []}
            doBaseUrl={`/app/subject/encounter?encounterUuid`}
            cancelBaseURL={`/app/subject/cancelEncounter?uuid`}
            onDelete={plannedEncounter => {
              setPlannedEncounterUUIDToBeVoided(plannedEncounter.uuid);
            }}
          />
          <ConfirmDialog
            title={t("GeneralEncounterVoidAlertTitle")}
            open={!isEmpty(plannedEncounterUUIDToBeVoided)}
            setOpen={() => setPlannedEncounterUUIDToBeVoided("")}
            message={t("GeneralEncounterVoidAlertMessage")}
            onConfirm={() => {
              handleVoidGeneralEncounter(plannedEncounterUUIDToBeVoided);
            }}
          />
        </StyledAccordionDetails>
      </StyledAccordion>
      <StyledAccordion onChange={() => setIsExpanded(p => !p)}>
        <StyledAccordionSummary
          expandIcon={<StyledExpandMore />}
          aria-controls="completedVisitPanelbh-content"
          id="completed-general-encounter-details"
        >
          <StyledTypography component="span">
            {t("completedVisits")}
          </StyledTypography>
        </StyledAccordionSummary>
        <StyledAccordionDetails>
          {isExpanded && (
            <CompletedVisits
              entityUuid={subjectUuid}
              isForProgramEncounters={false}
            />
          )}
        </StyledAccordionDetails>
      </StyledAccordion>
      <MessageDialog
        title={t("SubjectErrorTitle")}
        open={!isEmpty(voidError)}
        message={t(voidError)}
        onOk={handleClearVoidServerError}
      />
    </ContainerComponent>
  );
};

export default SubjectDashboardGeneralTab;
