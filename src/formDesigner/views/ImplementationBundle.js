import React, { Fragment } from "react";
import Button from "@material-ui/core/Button";
import http from "common/utils/httpClient";
import fileDownload from "js-file-download";
import { connect } from "react-redux";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { DocumentationContainer } from "../../common/components/DocumentationContainer";
import { get } from "lodash";
import ActivityIndicatorModal from "../../common/components/ActivityIndicatorModal";
import UserInfo from "../../common/model/UserInfo";
import { Privilege } from "openchs-models";

function ImplementationBundle({ organisation, userInfo }) {
  const [loading, setLoading] = React.useState(false);
  const [includeLocations, setIncludeLocations] = React.useState(false);
  const hasDownloadPrivilege = UserInfo.hasPrivilege(
    userInfo,
    Privilege.PrivilegeType.DownloadBundle
  );

  function onDownloadHandler() {
    setLoading(true);
    http
      .get(`/implementation/export/${includeLocations}`, {
        responseType: "blob"
      })
      .then(response => {
        setLoading(false);
        if (response.status === 200) {
          fileDownload(response.data, `${organisation.name}.zip`);
        }
      })
      .catch(error => {
        setLoading(false);
        const errorMessage = `${get(error, "response.data") ||
          get(error, "message") ||
          "unknown error"}`;
        alert(errorMessage);
      });
  }

  return (
    <Fragment>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        {hasDownloadPrivilege && (
          <DocumentationContainer filename={"Bundle.md"}>
            <Title title="Bundle" />
            <p>Download Implementation Bundle</p>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeLocations}
                  onChange={event => setIncludeLocations(event.target.checked)}
                  name="location"
                />
              }
              label="Include Locations"
            />
            <p />
            <Button variant="contained" color="primary" onClick={onDownloadHandler}>
              Download
            </Button>
          </DocumentationContainer>
        )}
        {!hasDownloadPrivilege && <p>You don't have the privilege to download bundle</p>}
      </Box>
      <ActivityIndicatorModal open={loading} />
    </Fragment>
  );
}

const mapStateToProps = state => ({
  organisation: state.app.organisation,
  userInfo: state.app.userInfo
});

export default connect(mapStateToProps)(ImplementationBundle);
