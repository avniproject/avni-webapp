import React from "react";
import { makeStyles } from "@mui/styles";
import { Box, Paper, Accordion, AccordionDetails, AccordionSummary, Typography } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import _, { filter, isEmpty, isNil } from "lodash";
import { connect } from "react-redux";
import SubjectVoided from "../../../components/SubjectVoided";
import PlannedVisitsTable from "../PlannedVisitsTable";
import { clearVoidServerError, voidGeneralEncounter } from "../../../reducers/subjectDashboardReducer";
import CompletedVisits from "./CompletedVisits";
import { NewGeneralEncounterButton } from "./NewGeneralEncounterButton";
import ConfirmDialog from "../../../components/ConfirmDialog";
import MessageDialog from "../../../components/MessageDialog";

const useStyles = makeStyles(theme => ({
  label: {
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  expansionPanel: {
    marginBottom: "11px",
    borderRadius: "5px",
    boxShadow: "0px 0px 3px 1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)"
  },
  root: {
    flexGrow: 1,
    padding: theme.spacing(2),
    boxShadow: "0px 0px 4px 1px rgba(0,0,0,0.3)"
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "left"
  },
  programStatusStyle: {
    color: "red",
    backgroundColor: "#FFB6C1",
    borderRadius: "5px"
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
  infomsg: {
    marginLeft: 10
  },
  expandMoreHoriz: {
    color: "#0e6eff"
  },
  visitAllButton: {
    marginLeft: "20px",
    marginBottom: "10px"
  }
}));

const SubjectDashboardGeneralTab = ({
  general,
  subjectUuid,
  subjectTypeUuid,
  subjectVoided,
  voidGeneralEncounter,
  displayGeneralInfoInProfileTab,
  voidError,
  clearVoidServerError
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [plannedEncounterUUIDToBeVoided, setPlannedEncounterUUIDToBeVoided] = React.useState("");

  const plannedVisits = filter(
    general,
    ({ voided, encounterDateTime, cancelDateTime }) => !voided && isNil(encounterDateTime) && isNil(cancelDateTime)
  );
  const ContainerComponent = displayGeneralInfoInProfileTab ? Box : Paper;

  return (
    <ContainerComponent className={displayGeneralInfoInProfileTab ? "" : classes.root}>
      {subjectVoided && <SubjectVoided showUnVoid={false} />}
      {!subjectVoided && !displayGeneralInfoInProfileTab && <NewGeneralEncounterButton subjectUuid={subjectUuid} />}
      <Accordion className={classes.expansionPanel}>
        <AccordionSummary
          expandIcon={<ExpandMore className={classes.expandMoreHoriz} />}
          aria-controls="plannedVisitPanelbh-content"
          id="planned-general-encounter-details"
        >
          <Typography component={"span"} className={classes.expansionHeading}>
            {t("plannedVisits")}
          </Typography>
        </AccordionSummary>
        <AccordionDetails style={{ padding: 0, display: "block" }}>
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
            open={!_.isEmpty(plannedEncounterUUIDToBeVoided)}
            setOpen={() => setPlannedEncounterUUIDToBeVoided()}
            message={t("GeneralEncounterVoidAlertMessage")}
            onConfirm={() => {
              voidGeneralEncounter(plannedEncounterUUIDToBeVoided);
            }}
          />
        </AccordionDetails>
      </Accordion>
      <Accordion className={classes.expansionPanel} onChange={() => setIsExpanded(p => !p)}>
        <AccordionSummary
          expandIcon={<ExpandMore className={classes.expandMoreHoriz} />}
          aria-controls="completedVisitPanelbh-content"
          id="completed-general-encounter-details"
        >
          <Typography component={"span"} className={classes.expansionHeading}>
            {t("completedVisits")}
          </Typography>
        </AccordionSummary>
        <AccordionDetails style={{ padding: 0, display: "block" }}>
          {isExpanded && <CompletedVisits entityUuid={subjectUuid} isForProgramEncounters={false} />}
        </AccordionDetails>
      </Accordion>
      <MessageDialog title={t("SubjectErrorTitle")} open={!isEmpty(voidError)} message={t(voidError)} onOk={clearVoidServerError} />
    </ContainerComponent>
  );
};

const mapDispatchToProps = {
  voidGeneralEncounter,
  clearVoidServerError
};

export default connect(
  null,
  mapDispatchToProps
)(SubjectDashboardGeneralTab);
