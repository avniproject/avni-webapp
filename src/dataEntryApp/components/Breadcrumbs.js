import React from "react";
import Typography from "@material-ui/core/Typography";
import { Breadcrumbs as MUIBreadcrumb } from "@material-ui/core";
import Link from "@material-ui/core/Link";
import { makeStyles } from "@material-ui/core/styles";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const parts = path.split(/\/+/g).filter(Boolean);
  const clickableParts = parts.slice(0, parts.length - 1);
  const currentpage = parts[parts.length - 1];
  const subjectName = props.subjectProfile && props.subjectProfile.nameString;
  const subjectUuid = props.subjectProfile && props.subjectProfile.uuid;
  const visitName = props.encounter && props.encounter.encounterType.name;
  const urlPartLabels = {
    APP: "app",
    SUBJECT: "subject",
    VIEW_VISIT: "viewProgramEncounter",
    COMPLETED_VISITS: "completedProgramEncounters",
    VIEW_ENCOUNTER: "viewEncounter",
    COMPLETED_ENCOUNTERS: "completedEncounters"
  };
  const urlMapper = part => {
    switch (part) {
      case urlPartLabels.APP: {
        return { breadcrumb: "Home", url: "#/app" };
      }
      case urlPartLabels.SUBJECT: {
        if (subjectName && subjectUuid) {
          return {
            breadcrumb: subjectName,
            url: "#/app/subject?uuid=" + subjectUuid
          };
        } else {
          return {
            breadcrumb: t("Dashboard"),
            url: "#/app"
          };
        }
      }
      case urlPartLabels.VIEW_VISIT: {
        if (visitName) {
          return {
            breadcrumb: `${t("ViewVisit")} ${t(visitName)}`,
            url: "#/app"
          };
        } else {
          return { breadcrumb: `${t("ViewVisit")}`, url: "#/app" };
        }
      }
      case urlPartLabels.COMPLETED_VISITS: {
        return { breadcrumb: t("completedVisits"), url: "#/app" };
      }
      case urlPartLabels.VIEW_ENCOUNTER: {
        if (visitName) {
          return {
            breadcrumb: `${t("ViewVisit")} ${t(visitName)}`,
            url: "#/app"
          };
        } else {
          return { breadcrumb: "View Visit", url: "#/app" };
        }
      }
      case urlPartLabels.COMPLETED_ENCOUNTERS: {
        return { breadcrumb: t("completedVisits"), url: "#/app" };
      }
      default:
        return { breadcrumb: part, url: "#/app" };
    }
  };

  return (
    <MUIBreadcrumb className={classes.Breadcrumbs} aria-label="breadcrumb">
      {clickableParts.map((part, index) => (
        <Link key={index} color="inherit" href={urlMapper(part).url}>
          {urlMapper(part).breadcrumb}
        </Link>
      ))}
      <Typography className={classes.Typography} component={"span"} color="textPrimary">
        {urlMapper(currentpage).breadcrumb}
      </Typography>
    </MUIBreadcrumb>
  );
};

const mapStateToProps = state => ({
  subjectProfile: state.dataEntry.subjectProfile.subjectProfile,
  encounter: state.dataEntry.viewVisitReducer.encounter
});

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      null
    )(Breadcrumbs)
  )
);
