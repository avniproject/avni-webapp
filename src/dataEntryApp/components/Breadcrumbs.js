import React from "react";
import Typography from "@material-ui/core/Typography";
import { Breadcrumbs as Breadcrumb } from "@material-ui/core";
import Link from "@material-ui/core/Link";
import { makeStyles } from "@material-ui/core/styles";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import { getSubjectProfile } from "../reducers/subjectDashboardReducer";

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
    props.subjectProfile && props.subjectProfile.firstName + " " + props.subjectProfile.lastName;
  const subjectUuid = props.subjectProfile && props.subjectProfile.uuid;
  const urlPartLabels = {
    APP: "app",
    SUBJECT: "subject",
    VIEW_VISIT: "viewVisit",
    COMPLETED_VISITS: "completedVisits"
  };
  const urlMapper = part => {
    switch (part) {
      case urlPartLabels.APP: {
        return { breadcrumb: "Home", url: "#/app" };
      }
      case urlPartLabels.SUBJECT: {
        if (subjectName && subjectUuid) {
          return {
            breadcrumb: subjectName + " " + "Dashborad",
            url: "#/app/subject?uuid=" + subjectUuid
          };
        } else {
          return {
            breadcrumb: "Dashborad",
            url: "#/app"
          };
        }
      }
      case urlPartLabels.VIEW_VISIT: {
        return { breadcrumb: "View Visit", url: "#/app" };
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
  subjectProfile: state.dataEntry.subjectProfile.subjectProfile
});

const mapDispatchToProps = {
  getSubjectProfile
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(Breadcrumbs)
  )
);
