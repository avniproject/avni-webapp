import React from "react";
import Grid from "@material-ui/core/Grid";
import { Link } from "react-router-dom";
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
import { InternalLink } from "../../../../common/components/utils";
import { enableReadOnly } from "common/constants";
// import { LineBreak, RelativeLink, withParams } from "../../../common/components/utils";
import { LineBreak, RelativeLink, withParams } from "../../../../common/components/utils";

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
  }
}));

const ProgramView = ({ programData }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [expandedPanel, setExpanded] = React.useState("");

  const handleChange = panel => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={4} container direction="row" justify="flex-start" alignItems="flex-start">
          <label className={classes.programLabel}>
            {t(programData.program.operationalProgramName)} {t("programdetails")}
          </label>
        </Grid>

        <Grid item xs={8} container direction="row" justify="flex-end" alignItems="flex-start">
          <SubjectButton btnLabel={t("Growth Chart")} btnClass={classes.growthButtonStyle} />
          <SubjectButton btnLabel={t("vaccinations")} btnClass={classes.vaccinationButtonStyle} />
          <SubjectButton
            btnLabel={t("newProgramVisit")}
            btnClass={classes.newProgVisitButtonStyle}
          />
        </Grid>
      </Grid>
      <Paper className={classes.root}>
        <ExpansionPanel
          className={classes.expansionPanel}
          expanded={expandedPanel === "enrollmentPanel"}
          onChange={handleChange("enrollmentPanel")}
        >
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
                <Observations observations={programData ? programData.observations : ""} />
              </List>
              {!enableReadOnly ? <Button color="primary">{t("void")}</Button> : ""}
              {!enableReadOnly ? <Button color="primary">{t("edit")}</Button> : ""}
            </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel
          className={classes.expansionPanel}
          expanded={expandedPanel === "plannedVisitPanel"}
          onChange={handleChange("plannedVisitPanel")}
        >
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
              {programData && programData.encounters
                ? programData.encounters.map((row, index) =>
                    !row.encounterDateTime ? (
                      <Visit
                        uuid={row.uuid}
                        name={row.name}
                        key={index}
                        index={index}
                        visitDate={row.encounterDateTime}
                        earliestVisitDate={row.earliestVisitDateTime}
                        overdueDate={row.maxVisitDateTime}
                      />
                    ) : (
                      ""
                    )
                  )
                : ""}
            </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <ExpansionPanel
          className={classes.expansionPanel}
          expanded={expandedPanel === "completedVisitPanel"}
          onChange={handleChange("completedVisitPanel")}
        >
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
              className={classes.gridBottomBorder}
            >
              {programData && programData.encounters
                ? programData.encounters.map((row, index) =>
                    row.encounterDateTime && row.encounterType && index <= 3 ? (
                      <Visit
                        uuid={row.uuid}
                        name={row.encounterType.name}
                        key={index}
                        index={index}
                        visitDate={row.encounterDateTime}
                        earliestVisitDate={row.earliestVisitDateTime}
                      />
                    ) : (
                      ""
                    )
                  )
                : ""}
            </Grid>
          </ExpansionPanelDetails>
          <Button color="primary">
            <Link to={`/app/completeVisit?id=${programData.id}&uuid=${programData.uuid}`}>
              {t("viewAllCompletedVisit")}
            </Link>
          </Button>
        </ExpansionPanel>
      </Paper>
    </div>
  );
};

export default ProgramView;
