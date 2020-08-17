import React from "react";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import { Paper } from "@material-ui/core";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import Observations from "../../../../common/components/Observations";
import Visit from "./Visit";
import Button from "@material-ui/core/Button";
import SubjectButton from "./Button";
import { useTranslation } from "react-i18next";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

import { undoExitEnrolment } from "../../../reducers/programEnrolReducer";

import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { InternalLink } from "../../../../common/components/utils";
import { enableReadOnly } from "common/constants";
import { LineBreak, RelativeLink, withParams } from "../../../../common/components/utils";
import { store } from "../../../../common/store/createStore";
import { types } from "../../../reducers/completedVisitsReducer";
import { Link } from "react-router-dom";
import moment from "moment";

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
    boxShadow:
      "0px 0px 3px 0px rgba(0,0,0,0.4), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)"
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
  table: {
    border: "1px solid rgba(224, 224, 224, 1)"
  },
  abnormalColor: {
    color: "#ff4f33"
  },
  expandMoreIcon: {
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
  enableReadOnly,
  subjectTypeUuid,
  subjectVoided
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [expandedPanel, setExpanded] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const enrolldata = {
    enrollmentId: programData.id,
    enrollmentUuid: programData.uuid
  };

  const handleChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleUndoExit = (programEnrolmentUuid, Link) => {
    undoExitEnrolment(programEnrolmentUuid);
    handleClose();
    handleUpdateComponent(subjectUuid);
  };

  let plannedVisits = [];
  let completedVisits = [];

  if (programData && programData.encounters) {
    programData.encounters.forEach(function(row, index) {
      if (!row.encounterDateTime) {
        let sub = {
          uuid: row.uuid,
          name: row.name,
          key: index,
          index: index,
          visitDate: row.encounterDateTime,
          earliestVisitDate: row.earliestVisitDateTime,
          overdueDate: row.maxVisitDateTime
        };
        plannedVisits.push(sub);
      } else if (row.encounterDateTime && row.encounterType && index <= 3) {
        let sub = {
          uuid: row.uuid,
          name: row.name,
          key: index,
          index: index,
          visitDate: row.encounterDateTime,
          earliestVisitDate: row.earliestVisitDateTime,
          overdueDate: row.maxVisitDateTime
        };
        completedVisits.push(sub);
      }
    });
  }

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={4} container direction="row" justify="flex-start" alignItems="flex-start">
          <label className={classes.programLabel}>
            {t(programData.program.operationalProgramName)} {t("programdetails")}
          </label>
        </Grid>

        <Grid item xs={8} container direction="row" justify="flex-end" alignItems="flex-start">
          {!enableReadOnly && !subjectVoided ? (
            <InternalLink
              to={`/app/subject/newProgramVisit?enrolUuid=${programData.uuid}`}
              noUnderline
            >
              <SubjectButton btnLabel={t("newProgramVisit")} />
            </InternalLink>
          ) : (
            ""
          )}
        </Grid>
      </Grid>
      <Paper className={classes.root}>
        <ExpansionPanel className={classes.expansionPanel}>
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon className={classes.expandMoreIcon} />}
            aria-controls="enrollmentPanelbh-content"
            id="panel1bh-header"
          >
            <Typography component={"span"} className={classes.expansionHeading}>
              {t("enrolmentDetails")}{" "}
            </Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={{ paddingTop: "0px" }}>
            <Grid item xs={12}>
              <List>
                <Observations
                  observations={
                    programData && !programData.programExitDateTime
                      ? programData.observations
                      : (programData && programData.exitObservations) || []
                  }
                  additionalRows={
                    programData && !programData.programExitDateTime
                      ? [
                          {
                            label: "Enrolment Date",
                            value: moment(programData.enrolmentDateTime).format("DD-MMM-YYYY")
                          }
                        ]
                      : programData
                      ? [
                          {
                            label: "Exit Enrolment Date",
                            value: moment(programData.programExitDateTime).format("DD-MMM-YYYY")
                          }
                        ]
                      : ""
                  }
                />
              </List>
              {!enableReadOnly ? (
                !programData.programExitDateTime ? (
                  <>
                    <Link
                      to={`/app/enrol?uuid=${subjectUuid}&programName=${
                        programData.program.operationalProgramName
                      }&formType=ProgramExit&programEnrolmentUuid=${programData.uuid}`}
                    >
                      <Button color="primary">{t("Exit")}</Button>
                    </Link>
                    <Link
                      to={`/app/enrol?uuid=${subjectUuid}&programName=${
                        programData.program.operationalProgramName
                      }&formType=ProgramEnrolment&programEnrolmentUuid=${programData.uuid}`}
                    >
                      <Button color="primary">{t("Edit")}</Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to={`/app/enrol?uuid=${subjectUuid}&programName=${
                        programData.program.operationalProgramName
                      }&formType=ProgramExit&programEnrolmentUuid=${programData.uuid}`}
                    >
                      <Button color="primary">{t("Edit Exit")}</Button>
                    </Link>

                    <Button color="primary" onClick={handleClickOpen}>
                      {t("Undo Exit")}
                    </Button>

                    <Dialog
                      open={open}
                      onClose={handleClose}
                      aria-labelledby="alert-dialog-title"
                      aria-describedby="alert-dialog-description"
                    >
                      <DialogTitle id="alert-dialog-title">{"Undo Exit"}</DialogTitle>
                      <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                          Do you want to undo exit and restore to enrolled state shows up
                        </DialogContentText>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={handleClose} color="primary">
                          Cancel
                        </Button>
                        <Button
                          onClick={handleUndoExit.bind(
                            this,
                            programData.uuid,
                            `/app/subject?uuid=${subjectUuid}&undo=true`
                          )}
                          color="primary"
                          autoFocus
                        >
                          Undo Exit
                        </Button>
                      </DialogActions>
                    </Dialog>
                  </>
                )
              ) : (
                ""
              )}
            </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel className={classes.expansionPanel}>
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon className={classes.expandMoreIcon} />}
            aria-controls="plannedVisitPanelbh-content"
            id="plannedVisitPanelbh-header"
          >
            <Typography component={"span"} className={classes.expansionHeading}>
              {t("plannedVisits")}
            </Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={{ paddingTop: "0px" }}>
            <Grid
              container
              direction="row"
              justify="flex-start"
              alignItems="flex-start"
              spacing={2}
            >
              {programData && programData.encounters && plannedVisits.length !== 0 ? (
                programData.encounters
                  .filter(
                    ({ encounterDateTime, cancelDateTime, voided }) =>
                      !voided && !encounterDateTime && !cancelDateTime
                  )
                  .map((row, index) => (
                    <Visit
                      type={"programEncounter"}
                      uuid={row.uuid}
                      name={row.name}
                      index={index}
                      visitDate={row.encounterDateTime}
                      earliestVisitDate={row.earliestVisitDateTime}
                      overdueDate={row.maxVisitDateTime}
                      enrolUuid={programData.uuid}
                      encounterTypeUuid={row.encounterType.uuid}
                      enableReadOnly={enableReadOnly}
                      cancelDateTime={row.cancelDateTime}
                      programUuid={programData.program.uuid}
                      subjectTypeUuid={subjectTypeUuid}
                    />
                  ))
              ) : (
                <Typography variant="caption" gutterBottom className={classes.infomsg}>
                  {" "}
                  {t("no")} {t("plannedVisits")}{" "}
                </Typography>
              )}
            </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel className={classes.expansionPanel}>
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon className={classes.expandMoreIcon} />}
            aria-controls="completedVisitPanelbh-content"
            id="completedVisitPanelbh-header"
          >
            <Typography component={"span"} className={classes.expansionHeading}>
              {t("completedVisits")}
            </Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={{ paddingTop: "0px" }}>
            <Grid
              container
              direction="row"
              justify="flex-start"
              alignItems="flex-start"
              spacing={2}
              className={
                programData && programData.encounters && completedVisits.length !== 0
                  ? classes.gridBottomBorder
                  : ""
              }
            >
              {programData && programData.encounters && completedVisits.length !== 0 ? (
                programData.encounters
                  .filter(
                    ({ encounterDateTime, cancelDateTime, voided }) =>
                      (cancelDateTime || encounterDateTime) && !voided
                  )
                  .slice(0, 3)
                  .map((row, index) => (
                    <Visit
                      uuid={row.uuid}
                      type={"programEncounter"}
                      name={row.encounterType.name}
                      key={index}
                      index={index}
                      visitDate={row.encounterDateTime}
                      earliestVisitDate={row.earliestVisitDateTime}
                      encounterDateTime={row.encounterDateTime}
                      enrolUuid={programData.uuid}
                      enableReadOnly={enableReadOnly}
                      cancelDateTime={row.cancelDateTime}
                      encounterTypeUuid={row.encounterType.uuid}
                      programUuid={programData.program.uuid}
                      subjectTypeUuid={subjectTypeUuid}
                    />
                  ))
              ) : (
                <Typography variant="caption" gutterBottom className={classes.infomsg}>
                  {" "}
                  {t("no")} {t("completedVisits")}{" "}
                </Typography>
              )}
            </Grid>
          </ExpansionPanelDetails>
          {programData && programData.encounters && completedVisits.length !== 0 ? (
            <InternalLink to={`/app/subject/completedProgramEncounters?uuid=${programData.uuid}`}>
              <Button color="primary" className={classes.visitAllButton}>
                {t("viewAllVisits")}
              </Button>
            </InternalLink>
          ) : (
            ""
          )}
        </ExpansionPanel>
      </Paper>
    </div>
  );
};

const mapStateToProps = state => ({
  subjectProgram: state.dataEntry.subjectProgram.subjectProgram
});

const mapDispatchToProps = {
  undoExitEnrolment
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(ProgramView)
  )
);
