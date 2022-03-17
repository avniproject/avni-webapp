import React, { Fragment } from "react";
import { Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import SubjectButton from "./Button";
import { useTranslation } from "react-i18next";
import { InternalLink } from "common/components/utils";
import { filter, isEmpty, isNil } from "lodash";
import { connect } from "react-redux";
import { selectFormMappingsForSubjectType } from "../../../sagas/encounterSelector";
import SubjectVoided from "../../../components/SubjectVoided";
import PlannedVisitsTable from "../PlannedVisitsTable";
import { voidGeneralEncounter } from "../../../reducers/subjectDashboardReducer";
import CompletedVisits from "./CompletedVisits";

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
  encounterFormMappings,
  subjectVoided,
  voidGeneralEncounter
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const plannedVisits = filter(
    general,
    ({ voided, encounterDateTime, cancelDateTime }) =>
      !voided && isNil(encounterDateTime) && isNil(cancelDateTime)
  );

  return (
    <Fragment>
      <Paper className={classes.root}>
        {subjectVoided && <SubjectVoided showUnVoid={false} />}
        <Grid container justify="flex-end">
          {!(isEmpty(plannedVisits) && isEmpty(encounterFormMappings)) && !subjectVoided ? (
            <InternalLink
              to={`/app/subject/newGeneralVisit?subjectUuid=${subjectUuid}`}
              noUnderline
              id={"new-general-visit"}
            >
              <SubjectButton btnLabel={t("newGeneralVisit")} />
            </InternalLink>
          ) : (
            ""
          )}
        </Grid>
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
              onDelete={uuid => voidGeneralEncounter(uuid)}
              deleteTitle={"GeneralEncounterVoidAlertTitle"}
              deleteMessage={"GeneralEncounterVoidAlertMessage"}
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
      </Paper>
    </Fragment>
  );
};

const mapStateToProps = (state, props) => ({
  encounterFormMappings: selectFormMappingsForSubjectType(props.subjectTypeUuid)(state)
});

const mapDispatchToProps = {
  voidGeneralEncounter
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SubjectDashboardGeneralTab);
