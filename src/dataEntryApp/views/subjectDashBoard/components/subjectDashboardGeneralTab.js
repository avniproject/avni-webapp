import React from "react";
import { Box, Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import { useTranslation } from "react-i18next";
import { filter, isNil } from "lodash";
import { connect } from "react-redux";
import SubjectVoided from "../../../components/SubjectVoided";
import PlannedVisitsTable from "../PlannedVisitsTable";
import { voidGeneralEncounter } from "../../../reducers/subjectDashboardReducer";
import CompletedVisits from "./CompletedVisits";
import { NewGeneralEncounterButton } from "./NewGeneralEncounterButton";
import ConfirmDialog from "../../../components/ConfirmDialog";

const useStyles = makeStyles(theme => ({
  label: {
    marginLeft: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  expansionPanel: {
    marginBottom: "11px",
    borderRadius: "5px",
    boxShadow:
      "0px 0px 3px 1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)"
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
  expandMoreIcon: {
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
  displayGeneralInfoInProfileTab
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [plannedEncounterUUIDToBeVoided, setPlannedEncounterUUIDToBeVoided] = React.useState();

  const plannedVisits = filter(
    general,
    ({ voided, encounterDateTime, cancelDateTime }) =>
      !voided && isNil(encounterDateTime) && isNil(cancelDateTime)
  );
  const ContainerComponent = displayGeneralInfoInProfileTab ? Box : Paper;

  return (
    <ContainerComponent className={displayGeneralInfoInProfileTab ? {} : classes.root}>
      {subjectVoided && <SubjectVoided showUnVoid={false} />}
      {!subjectVoided && !displayGeneralInfoInProfileTab && (
        <NewGeneralEncounterButton subjectUuid={subjectUuid} />
      )}
      <ExpansionPanel className={classes.expansionPanel}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon className={classes.expandMoreIcon} />}
          aria-controls="plannedVisitPanelbh-content"
          id="planned-general-encounter-details"
        >
          <Typography component={"span"} className={classes.expansionHeading}>
            {t("plannedVisits")}
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails style={{ padding: 0, display: "block" }}>
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
            open={plannedEncounterUUIDToBeVoided !== undefined}
            setOpen={() => setPlannedEncounterUUIDToBeVoided()}
            message={t("GeneralEncounterVoidAlertMessage")}
            onConfirm={() => {
              voidGeneralEncounter(plannedEncounterUUIDToBeVoided);
            }}
          />
        </ExpansionPanelDetails>
      </ExpansionPanel>
      <ExpansionPanel className={classes.expansionPanel} onChange={() => setIsExpanded(p => !p)}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon className={classes.expandMoreIcon} />}
          aria-controls="completedVisitPanelbh-content"
          id="completed-general-encounter-details"
        >
          <Typography component={"span"} className={classes.expansionHeading}>
            {t("completedVisits")}
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails style={{ padding: 0, display: "block" }}>
          {isExpanded && (
            <CompletedVisits entityUuid={subjectUuid} isForProgramEncounters={false} />
          )}
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </ContainerComponent>
  );
};

const mapDispatchToProps = {
  voidGeneralEncounter
};

export default connect(
  null,
  mapDispatchToProps
)(SubjectDashboardGeneralTab);
