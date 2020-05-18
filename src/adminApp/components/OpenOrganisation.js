import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import http from "common/utils/httpClient";
import Link from "@material-ui/core/Link";
import { getUserInfo } from "../../rootApp/ducks";

class OpenOrganisation extends Component {
  handleClick = organisationUUID => {
    localStorage.setItem("ORGANISATION_UUID", organisationUUID);
    this.props.getUserInfo();
  };

  render() {
    return (
      <Fragment>
        <Link href={"#/home"} onClick={() => this.handleClick(this.props.record.uuid)}>
          Go To Organisation
        </Link>
      </Fragment>
    );
  }
}

export default connect(
  null,
  { getUserInfo }
)(OpenOrganisation);
