import React, { Fragment, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import { getEncounter, getProgramEncounter } from "../../../reducers/viewVisitReducer";
import { withRouter, useHistory } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Observations from "common/components/Observations";
import Button from "@material-ui/core/Button";
import { InternalLink, LineBreak } from "../../../../common/components/utils";
import moment from "moment/moment";
import { useTranslation } from "react-i18next";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
    margin: theme.spacing(1, 3),
    flexGrow: 1,
    boxShadow:
      "0px 0px 3px 0px rgba(0,0,0,0.4), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)"
  },
  innerPaper: {
    padding: theme.spacing(2, 2),
    margin: theme.spacing(1, 1),
    flexGrow: 1,
    boxShadow:
      "0px 0px 3px 0px rgba(0,0,0,0.4), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 2px 1px -1px rgba(0,0,0,0.12)"
  },
  mainHeading: {
    fontSize: "20px",
    fontWeight: "500",
    marginLeft: 10,
    marginBottom: 10
  },
  scheduledHeading: {
    fontSize: "1vw",
    fontWeight: "300",
    marginBottom: 10
  },
  subHeading: {
    fontSize: "1vw",
    fontWeight: "bold"
  },
  summaryHeading: {
    fontSize: "18px",
    fontWeight: "bold"
  },
  programStatusStyle: {
    // color: "green",
    backgroundColor: "#54fb36a8",
    fontSize: "12px",
    padding: theme.spacing(0.6, 0.6),
    margin: theme.spacing(1, 1)
  },
  scheduleddateStyle: {
    marginBottom: 20,
    marginTop: 10
  },
  visitButton: {
    marginLeft: "8px",
    fontSize: "14px"
  }
}));

const ViewVisit = ({ match, getEncounter, getProgramEncounter, encounter, load }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const isViewEncounter = match.path === "/app/subject/viewEncounter";
  let viewAllCompletedUrl;

  if (encounter) {
    viewAllCompletedUrl = isViewEncounter
      ? `/app/subject/completedEncounters?uuid=${encounter.subjectUuid}`
      : `/app/subject/completedProgramEncounters?uuid=${encounter.enrolmentUuid}`;
  }
  useEffect(() => {
    isViewEncounter
      ? getEncounter(match.queryParams.uuid)
      : getProgramEncounter(match.queryParams.uuid);
  }, []);
  return encounter ? (
    <Fragment>
      <Breadcrumbs path={match.path} />
      <Paper className={classes.root}>
        <Grid container direction="row" justify="space-between" alignItems="baseline">
          <Typography component={"span"} className={classes.mainHeading}>
            {t("ViewVisit")}: {t(encounter.encounterType.name)}
          </Typography>
          {encounter.earliestVisitDateTime ? (
            <Typography component={"span"} className={classes.scheduledHeading}>
              {t("Scheduledon")}
              {":  "}
              {`${moment(new Date(encounter.earliestVisitDateTime)).format("DD-MM-YYYY")}`}
            </Typography>
          ) : (
            ""
          )}
        </Grid>
        <div className={classes.scheduleddateStyle}>
          <Typography component={"span"} className={classes.programStatusStyle}>
            {t("Completed")}
          </Typography>
          <Typography component={"span"} className={classes.subHeading}>
            {`${moment(new Date(encounter.encounterDateTime)).format("DD-MM-YYYY")}`}
          </Typography>
        </div>

        <Paper className={classes.innerPaper}>
          <Typography component={"span"} className={classes.summaryHeading}>
            {t("summary")}
          </Typography>
          <LineBreak num={2} />
          <Observations observations={encounter ? encounter.observations : ""} />
        </Paper>

        <InternalLink to={viewAllCompletedUrl}>
          <Button color="primary" className={classes.visitButton}>
            {t("viewAllCompletedVisits")}
          </Button>
        </InternalLink>
        {/* Re-direct to Dashboard on Back Click*/}
        {/* <InternalLink to={`/app/subject?uuid=${encounter.subjectUuid}`}>
          <Button color="primary" className={classes.visitButton}>
            {t("back")}
          </Button>
        </InternalLink> */}
        <Button color="primary" className={classes.visitButton} onClick={history.goBack}>
          {t("back")}
        </Button>
      </Paper>
    </Fragment>
  ) : (
    <CustomizedBackdrop load={load} />
  );
};

const mapStateToProps = state => ({
  encounter: state.dataEntry.viewVisitReducer.encounter,
  load: state.dataEntry.loadReducer.load
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
