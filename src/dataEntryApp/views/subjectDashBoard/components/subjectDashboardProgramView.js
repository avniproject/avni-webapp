import React, { useEffect } from "react";
import { makeStyles } from "@mui/styles";
import { Grid, Paper, Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { undoExitEnrolment } from "../../../reducers/programEnrolReducer";
import { withRouter } from "react-router-dom";
import { connect, useDispatch, useSelector } from "react-redux";
import { withParams } from "../../../../common/components/utils";
import { getProgramEnrolmentForm } from "../../../reducers/programSubjectDashboardReducer";
import { filter, get, isEmpty, isNil } from "lodash";
import { clearVoidServerError, voidProgramEncounter, voidProgramEnrolment } from "../../../reducers/subjectDashboardReducer";
import ConfirmDialog from "../../../components/ConfirmDialog";
import MessageDialog from "../../../components/MessageDialog";
import { fetchProgramSummary, selectFetchingRulesResponse, selectProgramSummary } from "../../../reducers/serverSideRulesReducer";
import { RuleSummary } from "./RuleSummary";
import { extensionScopeTypes } from "../../../../formDesigner/components/Extensions/ExtensionReducer";
import { ExtensionOption } from "./extension/ExtensionOption";
import { EnrolmentDetails } from "./EnrolmentDetails";
import PlannedVisitsTable from "../PlannedVisitsTable";
import CompletedVisits from "./CompletedVisits";
import { NewProgramEncounterButton } from "./NewProgramEncounterButton";

const useStyles = makeStyles(theme => ({
  programLabel: {
    fontSize: "18px",
    fontWeight: "500"
  },
  growthButtonStyle: {
    marginBottom: theme.spacing(2),
    height: "28px",
    boxShadow: "none",
    marginRight: "10px",
    marginLeft: "120px",
    backgroundColor: "#0e6eff"
  },
  vaccinationButtonStyle: {
    marginBottom: theme.spacing(2),
    boxShadow: "none",
    height: "28px",
    backgroundColor: "#0e6eff"
  },
  newProgVisitButtonStyle: {
    marginBottom: theme.spacing(2),
    boxShadow: "none",
    height: "28px",
    marginLeft: "10px",
    backgroundColor: "#0e6eff"
  },
  root: {
    flexGrow: 1,
    padding: theme.spacing(2),
    boxShadow: "0px 0px 4px 0px rgba(0,0,0,0.3)"
  },
  expansionPanel: {
    marginBottom: "11px",
    borderRadius: "5px",
    boxShadow: "0px 0px 3px 0px rgba(0,0,0,0.4), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)"
  },
  paper: {
    textAlign: "left",
    boxShadow: "none",
    borderRadius: "0px",
    borderRight: "1px solid #dcdcdc",
    padding: "0px"
  },
  programStatusStyle: {
    color: "red",
    backgroundColor: "#ffeaea",
    fontSize: "12px",
    padding: "2px 5px"
  },
  expansionHeading: {
    fontSize: theme.typography.pxToRem(16),
    flexBasis: "33.33%",
    flexShrink: 0,
    fontWeight: "500"
  },
  listItem: {
    paddingBottom: "0px",
    paddingTop: "0px"
  },
  ListItemText: {
    "& span": {
      fontSize: "14px"
    },
    color: "#2196f3",
    fontSize: "14px",
    textTransform: "uppercase"
  },
  listItemTextDate: {
    "& span": {
      fontSize: "15px",
      color: "#555555"
    }
  },
  tableContainer: {
    border: "1px solid rgba(224, 224, 224, 1)"
  },
  abnormalColor: {
    color: "#ff4f33"
  },
  expandMoreHoriz: {
    color: "#0e6eff"
  },
  visitButton: {
    marginLeft: "8px",
    fontSize: "14px"
  },
  gridBottomBorder: {
    borderBottom: "1px solid rgba(0,0,0,0.12)",
    paddingBottom: "10px"
  },
  infomsg: {
    marginLeft: 10
  },
  visitAllButton: {
    marginLeft: "20px",
    marginBottom: "10px"
  }
}));

const ProgramView = ({
  programData,
  subjectUuid,
  undoExitEnrolment,
  handleUpdateComponent,
  subjectTypeUuid,
  subjectVoided,
  programEnrolmentForm,
  getProgramEnrolmentForm,
  subjectProfile,
  voidError,
  clearVoidServerError,
  voidProgramEnrolment,
  voidProgramEncounter,
  organisationConfigs
}) => {
  React.useEffect(() => {
    const formType = programData.programExitDateTime ? "ProgramExit" : "ProgramEnrolment";
    getProgramEnrolmentForm(subjectProfile.subjectType.name, programData.program.operationalProgramName, formType);
  }, [programData.program.operationalProgramName]);

  const classes = useStyles();
  const { t } = useTranslation();
  const isNotExited = isNil(programData.programExitDateTime);

  const [voidConfirmation, setVoidConfirmation] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [plannedEncounterUUIDToBeVoided, setPlannedEncounterUUIDToBeVoided] = React.useState();
  const dispatch = useDispatch();

  const programSummary = useSelector(selectProgramSummary);
  const isFetchingSummary = useSelector(selectFetchingRulesResponse);

  useEffect(() => {
    dispatch(fetchProgramSummary(programData.uuid));
  }, [dispatch, programData.uuid]);

  const plannedVisits = filter(
    get(programData, "encounters", []),
    ({ voided, encounterDateTime, cancelDateTime }) => !voided && isNil(encounterDateTime) && isNil(cancelDateTime)
  );

  return (
    <div>
      <Grid container>
        <ExtensionOption
          subjectUUIDs={subjectProfile.uuid}
          typeUUID={programData.program.uuid}
          typeName={programData.program.operationalProgramName}
          scopeType={extensionScopeTypes.programEnrolment}
          configExtensions={get(organisationConfigs, "organisationConfig.extensions")}
        />
        <Grid
          container
          direction="row"
          sx={{
            justifyContent: "flex-start",
            alignItems: "flex-start"
          }}
          size={4}
        >
          <label className={classes.programLabel}>
            {t(programData.program.operationalProgramName)} {t("programdetails")}
          </label>
        </Grid>
        {!subjectVoided && isNotExited && <NewProgramEncounterButton enrolmentUUID={programData.uuid} />}
      </Grid>
      <Paper className={classes.root}>
        <RuleSummary title={"programSummary"} isFetching={isFetchingSummary} summaryObservations={programSummary} />
        {programData && programData.programExitDateTime && (
          <EnrolmentDetails
            t={t}
            isExit={true}
            label={"programExitDetails"}
            programData={programData}
            programEnrolmentForm={programEnrolmentForm}
            subjectUuid={subjectUuid}
            subjectProfile={subjectProfile}
            undoExitEnrolment={undoExitEnrolment}
            handleUpdateComponent={handleUpdateComponent}
            setVoidConfirmation={setVoidConfirmation}
          />
        )}
        <EnrolmentDetails
          t={t}
          isExit={false}
          label={"enrolmentDetails"}
          programData={programData}
          programEnrolmentForm={programEnrolmentForm}
          subjectUuid={subjectUuid}
          subjectProfile={subjectProfile}
          undoExitEnrolment={undoExitEnrolment}
          handleUpdateComponent={handleUpdateComponent}
          setVoidConfirmation={setVoidConfirmation}
        />
        <Accordion className={classes.expansionPanel}>
          <AccordionSummary
            expandIcon={<ExpandMore className={classes.expandMoreHoriz} />}
            aria-controls="plannedVisitPanelbh-content"
            id="planned-program-encounter-details"
          >
            <Typography component={"span"} className={classes.expansionHeading}>
              {t("plannedVisits")}
            </Typography>
          </AccordionSummary>
          <AccordionDetails style={{ padding: 0, display: "block" }}>
            <PlannedVisitsTable
              plannedVisits={plannedVisits || []}
              doBaseUrl={`/app/subject/programEncounter?encounterUuid`}
              cancelBaseURL={`/app/subject/cancelProgramEncounter?uuid`}
              onDelete={plannedEncounter => {
                setPlannedEncounterUUIDToBeVoided(plannedEncounter.uuid);
              }}
            />
            <ConfirmDialog
              title={t("ProgramEncounterVoidAlertTitle")}
              open={plannedEncounterUUIDToBeVoided !== undefined}
              setOpen={() => setPlannedEncounterUUIDToBeVoided()}
              message={t("ProgramEncounterVoidAlertMessage")}
              onConfirm={() => {
                voidProgramEncounter(plannedEncounterUUIDToBeVoided);
              }}
            />
          </AccordionDetails>
        </Accordion>
        <Accordion className={classes.expansionPanel} onChange={() => setIsExpanded(p => !p)}>
          <AccordionSummary
            expandIcon={<ExpandMore className={classes.expandMoreHoriz} />}
            aria-controls="completedVisitPanelbh-content"
            id="completed-program-encounter-details"
          >
            <Typography component={"span"} className={classes.expansionHeading}>
              {t("completedVisits")}
            </Typography>
          </AccordionSummary>
          <AccordionDetails style={{ padding: 0, display: "block" }}>
            {isExpanded && <CompletedVisits entityUuid={programData.uuid} isForProgramEncounters={true} />}
          </AccordionDetails>
        </Accordion>
      </Paper>
      <ConfirmDialog
        title={t("ProgramEnrolmentVoidAlertTitle")}
        open={voidConfirmation}
        setOpen={setVoidConfirmation}
        message={t("ProgramEnrolmentVoidAlertMessage")}
        onConfirm={() => voidProgramEnrolment(programData.uuid)}
      />
      <MessageDialog title={t("ProgramEnrolmentErrorTitle")} open={!isEmpty(voidError)} message={voidError} onOk={clearVoidServerError} />
    </div>
  );
};

const mapStateToProps = state => ({
  subjectProgram: state.dataEntry.subjectProgram.subjectProgram,
  subjectProfile: state.dataEntry.subjectProfile.subjectProfile,
  programEnrolmentForm: state.dataEntry.subjectProgram.programEnrolmentForm,
  voidError: state.dataEntry.subjectProfile.voidError,
  organisationConfigs: state.dataEntry.metadata.organisationConfigs
});

const mapDispatchToProps = {
  undoExitEnrolment,
  getProgramEnrolmentForm,
  voidProgramEnrolment,
  clearVoidServerError,
  voidProgramEncounter
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(ProgramView)
  )
);
