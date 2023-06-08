import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { fetchEnd, fetchStart, showNotification, Button } from "react-admin";

import EtlJobService from "./service/etl/EtlJobService";

class ToggleAnalyticsButton extends Component {
  state = {
    busy: false,
    error: false
  };

  handleClick() {
    const { fetchStart, fetchEnd, showNotification, record } = this.props;

    // Dispatch an action letting react-admin know a API call is ongoing
    fetchStart();

    // As we want to know when the new post has been created in order to close the modal, we use the
    // dataProvider directly
    const toggleFn = record.analyticsDataSyncActive
      ? EtlJobService.disableJob
      : EtlJobService.createOrEnableJob;
    toggleFn(record.uuid)
      .catch(error => {
        showNotification(error.message, "error");
      })
      .finally(() => {
        // Dispatch an action letting react-admin know a API call has ended
        fetchEnd();
      });
  }

  render() {
    const { analyticsDataSyncActive } = this.props.record;
    const label = analyticsDataSyncActive ? "Disable" : "Enable";

    return (
      <Fragment>
        <Button
          onClick={() => this.handleClick()}
          label={`${label} - Analytics Data Sync`}
          variant={"contained"}
        />
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
