import React from "react";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import httpClient from "../common/utils/httpClient";
import IdpFactory from "./security/IdpFactory";
import IdpDetails from "./security/IdpDetails";
import { Typography } from "@material-ui/core";

function IdpButton({ idpType, title, onIdpChosen }) {
  return (
    <Button
      variant="contained"
      color="primary"
      style={{ marginRight: 30 }}
      onClick={() => {
        httpClient.setIdp(IdpFactory.createIdp(idpType, httpClient.idp.idpDetails));
        onIdpChosen();
      }}
    >
      {title}
    </Button>
  );
}

function ChooseIdpView({ onIdpChosen }) {
  return (
    <Box style={{ backgroundColor: "darkgray" }}>
      <Typography variant={"h4"} style={{ color: "white", marginBottom: 300 }}>
        There are IDP types configured, please choose which one is used by your organisation
      </Typography>
      <Box
        style={{ flexDirection: "row", justifyContent: "center", display: "flex", marginTop: 100 }}
      >
        <IdpButton idpType={IdpDetails.cognito} title="COGNITO" onIdpChosen={onIdpChosen} />
        <IdpButton idpType={IdpDetails.keycloak} title="KEYCLOAK" onIdpChosen={onIdpChosen} />
      </Box>
    </Box>
  );
}

export default ChooseIdpView;
