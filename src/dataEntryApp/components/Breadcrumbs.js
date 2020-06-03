import React from "react";
import Typography from "@material-ui/core/Typography";
import { Breadcrumbs as Breadcrumb } from "@material-ui/core";
import Link from "@material-ui/core/Link";
import { makeStyles } from "@material-ui/core/styles";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import { getSubjectProfile } from "../reducers/subjectDashboardReducer";
import { getEncounter } from "../reducers/viewVisitReducer";
import { capitalize } from "lodash";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3, 2),
    margin: theme.spacing(1, 3),
    flexGrow: 1
  },
  Breadcrumbs: {
    margin: "12px 24px",
    fontSize: "12px"
  },
  Typography: {
    fontSize: "12px"
  }
}));

const Breadcrumbs = ({ path, match, ...props }) => {
  const classes = useStyles();
  const parts = path.split(/\/+/g).filter(Boolean);
  const clickableParts = parts.slice(0, parts.length - 1);
  const currentpage = parts[parts.length - 1];
  const subjectName =
    props.subjectProfile &&
    capitalize(props.subjectProfile.firstName) +
      " " +
      capitalize(props.subjectProfile.lastName || "");
  const subjectUuid = props.subjectProfile && props.subjectProfile.uuid;
  const visitName = props.encounter && props.encounter.encounterType.name;
  const urlPartLabels = {
    APP: "app",
    SUBJECT: "subject",
    VIEW_VISIT: "viewProgramEncounter",
    COMPLETED_VISITS: "completedProgramEncounters"
  };
  const urlMapper = part => {
    switch (part) {
      case urlPartLabels.APP: {
        return { breadcrumb: "Home", url: "#/app" };
      }
      case urlPartLabels.SUBJECT: {
        if (subjectName && subjectUuid) {
          return {
            breadcrumb: subjectName + " " + "Dashboard",
            url: "#/app/subject?uuid=" + subjectUuid
          };
        } else {
          return {
            breadcrumb: "Dashboard",
            url: "#/app"
          };
        }
      }
      case urlPartLabels.VIEW_VISIT: {
        if (visitName) {
          return {
            breadcrumb: "View Visit" + " " + visitName,
            url: "#/app"
          };
        } else {
          return { breadcrumb: "View Visit", url: "#/app" };
        }
      }
      case urlPartLabels.COMPLETED_VISITS: {
        return { breadcrumb: "Completed Visits", url: "#/app" };
      }
      default:
        return { breadcrumb: part, url: "#/app" };
    }
  };

  return (
    <Breadcrumb className={classes.Breadcrumbs} aria-label="breadcrumb">
      {clickableParts.map((part, index) => (
        <Link key={index} color="inherit" href={urlMapper(part).url}>
          {urlMapper(part).breadcrumb}
        </Link>
      ))}
      <Typography className={classes.Typography} component={"span"} color="textPrimary">
        {urlMapper(currentpage).breadcrumb}
      </Typography>
    </Breadcrumb>
  );
};

const mapStateToProps = state => ({
  subjectProfile: state.dataEntry.subjectProfile.subjectProfile,
  encounter: state.dataEntry.viewVisitReducer.encounter
});

const mapDispatchToProps = {
  getSubjectProfile,
  getEncounter
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(Breadcrumbs)
  )
);
