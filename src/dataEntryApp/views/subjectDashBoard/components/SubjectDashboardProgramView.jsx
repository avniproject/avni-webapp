import { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import {
  Grid,
  Paper,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Stack,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { undoExitEnrolment } from "../../../reducers/programEnrolReducer";
import { getProgramEnrolmentForm } from "../../../reducers/programSubjectDashboardReducer";
import { filter, get, isEmpty, isNil } from "lodash";
import {
  clearVoidServerError,
  voidProgramEncounter,
  voidProgramEnrolment,
} from "../../../reducers/subjectDashboardReducer";
import ConfirmDialog from "../../../components/ConfirmDialog";
import MessageDialog from "../../../components/MessageDialog";
import {
  fetchProgramSummary,
  selectFetchingRulesResponse,
  selectProgramSummary,
} from "../../../reducers/serverSideRulesReducer";
import RuleSummary from "./RuleSummary";
import { extensionScopeTypes } from "../../../../formDesigner/components/Extensions/ExtensionReducer";
import { ExtensionOption } from "./extension/ExtensionOption";
import { EnrolmentDetails } from "./EnrolmentDetails";
import PlannedVisitsTable from "../PlannedVisitsTable";
import CompletedVisits from "./CompletedVisits";
import { NewProgramEncounterButton } from "./NewProgramEncounterButton";

const StyledGridContainer = styled(Grid)({
  // Root container styles, if needed
});

const StyledStackContainer = styled(Stack)({
  // Root container styles, if needed
});

const StyledProgramLabel = styled("label")({
  fontSize: "18px",
  fontWeight: "500",
});

const StyledGridLabel = styled(Grid)({
  justifyContent: "flex-start",
  alignItems: "flex-start",
  flexGrow: 1,
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(2),
  boxShadow: "0px 0px 4px 0px rgba(0,0,0,0.3)",
  elevation: 2,
}));

const StyledAccordion = styled(Accordion)({
  marginBottom: "11px",
  borderRadius: "5px",
  boxShadow:
    "0px 0px 3px 0px rgba(0,0,0,0.4), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)",
});

const StyledAccordionSummary = styled(AccordionSummary)({});

const StyledAccordionDetails = styled(AccordionDetails)({
  padding: 0,
  display: "block",
});

const StyledTypography = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(16),
  flexBasis: "33.33%",
  flexShrink: 0,
  fontWeight: "500",
}));

const StyledExpandMore = styled(ExpandMore)({
  color: "#0e6eff",
});

const ProgramView = ({
  programData,
  subjectUuid,
  handleUpdateComponent,
  subjectTypeUuid,
  subjectVoided,
}) => {
  // Use Redux hooks instead of connect
  const dispatch = useDispatch();
  const subjectProfile = useSelector(
    (state) => state.dataEntry.subjectProfile.subjectProfile,
  );
  const programEnrolmentForm = useSelector(
    (state) => state.dataEntry.subjectProgram.programEnrolmentForm,
  );
  const voidError = useSelector(
    (state) => state.dataEntry.subjectProfile.voidError,
  );
  const organisationConfigs = useSelector(
    (state) => state.dataEntry.metadata.organisationConfigs,
  );
  const enrolmentSaveErrorKey = useSelector(
    (state) => state.dataEntry.enrolmentReducer.enrolmentSaveErrorKey,
  );
  const programSummary = useSelector(selectProgramSummary);
  const isFetchingSummary = useSelector(selectFetchingRulesResponse);

  const { t } = useTranslation();
  const isNotExited = isNil(programData.programExitDateTime);

  const [voidConfirmation, setVoidConfirmation] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [plannedEncounterUUIDToBeVoided, setPlannedEncounterUUIDToBeVoided] =
    useState();

  useEffect(() => {
    const formType = programData.programExitDateTime
      ? "ProgramExit"
      : "ProgramEnrolment";
    dispatch(
      getProgramEnrolmentForm(
        subjectProfile.subjectType.name,
        programData.program.operationalProgramName,
        formType,
      ),
    );
  }, [
    dispatch,
    programData.program.operationalProgramName,
    programData.programExitDateTime,
    subjectProfile.subjectType.name,
  ]);

  useEffect(() => {
    dispatch(fetchProgramSummary(programData.uuid));
  }, [dispatch, programData.uuid]);

  const handleUndoExitEnrolment = (...args) => {
    dispatch(undoExitEnrolment(...args));
  };

  const handleVoidProgramEnrolment = (uuid) => {
    dispatch(voidProgramEnrolment(uuid));
  };

  const handleClearVoidServerError = () => {
    dispatch(clearVoidServerError());
  };

  const handleVoidProgramEncounter = (uuid) => {
    dispatch(voidProgramEncounter(uuid));
  };

  const plannedVisits = filter(
    get(programData, "encounters", []),
    ({ voided, encounterDateTime, cancelDateTime }) =>
      !voided && isNil(encounterDateTime) && isNil(cancelDateTime),
  );

  return (
    <StyledStackContainer>
      <StyledGridContainer container>
        <ExtensionOption
          subjectUUIDs={subjectProfile.uuid}
          typeUUID={programData.program.uuid}
          typeName={programData.program.operationalProgramName}
          scopeType={extensionScopeTypes.programEnrolment}
          configExtensions={get(
            organisationConfigs,
            "organisationConfig.extensions",
          )}
        />
        <StyledGridLabel container direction="row" size={4}>
          <StyledProgramLabel>
            {t(programData.program.operationalProgramName)}{" "}
            {t("programdetails")}
          </StyledProgramLabel>
        </StyledGridLabel>
        {!subjectVoided && isNotExited && (
          <NewProgramEncounterButton enrolmentUUID={programData.uuid} />
        )}
      </StyledGridContainer>
      <StyledPaper>
        <RuleSummary
          title="programSummary"
          isFetching={isFetchingSummary}
          summaryObservations={programSummary}
        />
        {programData && programData.programExitDateTime && (
          <EnrolmentDetails
            t={t}
            isExit={true}
            label="programExitDetails"
            programData={programData}
            programEnrolmentForm={programEnrolmentForm}
            subjectUuid={subjectUuid}
            subjectProfile={subjectProfile}
            undoExitEnrolment={handleUndoExitEnrolment}
            handleUpdateComponent={handleUpdateComponent}
            setVoidConfirmation={setVoidConfirmation}
            enrolmentSaveErrorKey={enrolmentSaveErrorKey}
          />
        )}
        <EnrolmentDetails
          t={t}
          isExit={false}
          label="enrolmentDetails"
          programData={programData}
          programEnrolmentForm={programEnrolmentForm}
          subjectUuid={subjectUuid}
          subjectProfile={subjectProfile}
          undoExitEnrolment={handleUndoExitEnrolment}
          handleUpdateComponent={handleUpdateComponent}
          setVoidConfirmation={setVoidConfirmation}
        />
        <StyledAccordion>
          <StyledAccordionSummary
            expandIcon={<StyledExpandMore />}
            aria-controls="plannedVisitPanelbh-content"
            id="planned-program-encounter-details"
          >
            <StyledTypography component="span">
              {t("plannedVisits")}
            </StyledTypography>
          </StyledAccordionSummary>
          <StyledAccordionDetails>
            <PlannedVisitsTable
              plannedVisits={plannedVisits || []}
              doBaseUrl={`/app/subject/programEncounter?encounterUuid`}
              cancelBaseURL={`/app/subject/cancelProgramEncounter?uuid`}
              onDelete={(plannedEncounter) => {
                setPlannedEncounterUUIDToBeVoided(plannedEncounter.uuid);
              }}
            />
            <ConfirmDialog
              title={t("ProgramEncounterVoidAlertTitle")}
              open={plannedEncounterUUIDToBeVoided !== undefined}
              setOpen={() => setPlannedEncounterUUIDToBeVoided()}
              message={t("ProgramEncounterVoidAlertMessage")}
              onConfirm={() => {
                handleVoidProgramEncounter(plannedEncounterUUIDToBeVoided);
              }}
            />
          </StyledAccordionDetails>
        </StyledAccordion>
        <StyledAccordion onChange={() => setIsExpanded((p) => !p)}>
          <StyledAccordionSummary
            expandIcon={<StyledExpandMore />}
            aria-controls="completedVisitPanelbh-content"
            id="completed-program-encounter-details"
          >
            <StyledTypography component="span">
              {t("completedVisits")}
            </StyledTypography>
          </StyledAccordionSummary>
          <StyledAccordionDetails>
            {isExpanded && (
              <CompletedVisits
                entityUuid={programData.uuid}
                isForProgramEncounters={true}
              />
            )}
          </StyledAccordionDetails>
        </StyledAccordion>
      </StyledPaper>
      <ConfirmDialog
        title={t("ProgramEnrolmentVoidAlertTitle")}
        open={voidConfirmation}
        setOpen={setVoidConfirmation}
        message={t("ProgramEnrolmentVoidAlertMessage")}
        onConfirm={() => handleVoidProgramEnrolment(programData.uuid)}
      />
      <MessageDialog
        title={t("ProgramEnrolmentErrorTitle")}
        open={!isEmpty(voidError)}
        message={t(voidError)}
        onOk={handleClearVoidServerError}
      />
    </StyledStackContainer>
  );
};

export default ProgramView;
