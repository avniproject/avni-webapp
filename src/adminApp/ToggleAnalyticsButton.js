import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { fetchEnd, fetchStart, showNotification, Button } from "react-admin";
import { CircularProgress } from "@mui/material";

import EtlJobService from "./service/etl/EtlJobService";
import { Redirect } from "react-router-dom";

class ToggleAnalyticsButton extends Component {
  state = {
    busy: false,
    error: false,
    actionCompleted: false
  };

  async handleClick() {
    this.setState({ busy: true });

    const { fetchStart, fetchEnd, showNotification, record, resource } = this.props;

    // Dispatch an action letting react-admin know a API call is ongoing
    fetchStart();

    // As we want to know when the new post has been created in order to close the modal, we use the
    // dataProvider directly
    const toggleFn = record.analyticsDataSyncActive ? EtlJobService.disableJob : EtlJobService.createOrEnableJob;
    toggleFn(record.uuid, resource)
      .catch(error => {
        showNotification(error.message, "error");
      })
      .finally(() => {
        // Dispatch an action letting react-admin know a API call has ended
        fetchEnd();
        this.setState({ busy: false, actionCompleted: true });
      });
  }

  render() {
    const { resource, record } = this.props;
    const { analyticsDataSyncActive, id } = record;
    const { busy, actionCompleted } = this.state;

    if (actionCompleted) return <Redirect to={`/admin/${resource}/${id}/show`} />;

    const label = analyticsDataSyncActive ? "Disable" : "Enable";

    return (
      <Fragment>
        <Button disabled={busy} onClick={() => this.handleClick()} label={`${label} - Analytics Data Sync`} variant={"contained"}>
          {busy && <CircularProgress />}
        </Button>
      </Fragment>
    );
  }
}

const mapDispatchToProps = {
  fetchEnd,
  fetchStart,
  showNotification
};

export default connect(
  null,
  mapDispatchToProps
)(ToggleAnalyticsButton);
