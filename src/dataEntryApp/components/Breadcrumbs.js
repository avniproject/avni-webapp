import React, { useEffect } from "react";
import Typography from "@material-ui/core/Typography";
import { Breadcrumbs as Breadcrumb } from "@material-ui/core";
import Link from "@material-ui/core/Link";
import { makeStyles } from "@material-ui/core/styles";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "common/components/utils";
import { isEqual } from "lodash";
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
  console.log("In breadcrumb ..props", props);
  console.log("In breadcrumb ..Path", path);
  const parts = path.split(/\/+/g).filter(Boolean);
  console.log("Parts", parts);
  const clickableParts = parts.slice(0, parts.length - 1);

  const currentpage = parts[parts.length - 1];
  //   const isSubject = isEqual(match.path, "/app/subject");
  //   useEffect(() => {
  //   if (isSubject){
  //     const subjectUuid = match.queryParams.uuid;
  //     props.getSubjectProfile(subjectUuid);
  //   }
  // }, []);
  const subjectName =
    props.subjectProfile && props.subjectProfile.firstName + " " + props.subjectProfile.lastName;
  const subjectUuid = props.subjectProfile && props.subjectProfile.uuid;
  const urlMappings = [
    { path: "app", breadcrumb: "Home", url: "#/app" },
    {
      path: "subject",
      breadcrumb: subjectName + " " + "Dashborad",
      url: "#/app/subject?uuid=" + subjectUuid
    },
    { path: "completeVisit", breadcrumb: "Completed Visits", url: "#/app" }
  ];
  console.log(props.subjectProfile);
  console.log("all states", props.x);

  return (
    <Breadcrumb className={classes.Breadcrumbs} aria-label="breadcrumb">
      {clickableParts.map((part, index) => (
        <Link key={index} color="inherit" href={urlMappings.find(um => um.path === part).url}>
          {urlMappings.find(um => um.path === part).breadcrumb}

          {/* {part} */}
        </Link>
      ))}
      <Typography className={classes.Typography} component={"span"} color="textPrimary">
        {urlMappings.find(um => um.path === currentpage).breadcrumb}
        {/* {currentpage} */}
      </Typography>
    </Breadcrumb>
  );
};

const mapStateToProps = state => ({
  subjectProfile: state.dataEntry.subjectProfile.subjectProfile,
  x: state
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
