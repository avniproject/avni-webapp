import React from "react";
import ActivityCard from "../components/ActivityCard";
import { Grid } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import { connect } from "react-redux";
import { getActivityReport } from "../reducers";
import { withRouter } from "react-router-dom";

const ActivityReport = ({ activityReport, getActivityReport }) => {
  React.useEffect(() => {
    getActivityReport();
  }, []);

  const renderActivityCard = (title, propertyName) => {
    return activityReport[propertyName].total > 0 ? (
      <ActivityCard
        title={title}
        total={activityReport[propertyName].total}
        data={activityReport[propertyName].data}
      />
    ) : (
      <div />
    );
  };

  return (
    <Box border={1} m={2} borderColor={"#ddd"} p={2}>
      {activityReport && (
        <Grid container direction="row" alignItems="baseline" spacing={4}>
          <Grid item>{renderActivityCard("Registrations", "registrations")}</Grid>
          <Grid item>{renderActivityCard("Enrolments", "enrolments")}</Grid>
          <Grid item>{renderActivityCard("Completed Visits", "completedVisits")}</Grid>
        </Grid>
      )}
    </Box>
  );
};

const mapStateToProps = state => ({
  activityReport: state.reports.activityReport
});

export default withRouter(
  connect(
    mapStateToProps,
    { getActivityReport }
  )(ActivityReport)
);
