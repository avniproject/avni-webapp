import { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { map, filter, get } from "lodash";
import { Button, Grid } from "@mui/material";
import { isDevEnv } from "../../../../../common/constants";
import { extensionScopeTypes } from "../../../../../formDesigner/components/Extensions/ExtensionReducer";
import commonApi from "../../../../../common/service";
import httpClient from "../../../../../common/utils/httpClient";

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  color: "#FFFFFF",
  backgroundColor: "#0000ff",
  "&:hover": {
    backgroundColor: "#0000A2"
  },
  marginBottom: theme.spacing(2)
}));

export const ExtensionOption = ({ subjectUUIDs, typeUUID, typeName, scopeType, configExtensions }) => {
  const [extensions, setExtensions] = useState([]);

  useEffect(() => {
    if (!configExtensions) {
      commonApi.fetchOrganisationConfigs().then(config => {
        const extensions = get(config, "organisationConfig.extensions", []);
        setExtensions(extensions);
      });
    } else {
      setExtensions(configExtensions);
    }
  }, []);

  const isSearchScope = (scopeType, extensionScope) =>
    scopeType === extensionScopeTypes.searchResults && extensionScope === extensionScopeTypes.searchResults;

  const filteredSettings = filter(
    extensions,
    ({ extensionScope }) =>
      isSearchScope(scopeType, extensionScope.scopeType) ||
      (typeUUID === extensionScope.uuid && typeName === extensionScope.name && scopeType === extensionScope.scopeType)
  );

  const serverURL = isDevEnv ? "http://localhost:8021" : window.location.origin;

  const clickHandler = async fileName => {
    const token = await httpClient.idp.getTokenParam();
    const params = `subjectUUIDs=${subjectUUIDs}&${token}`;
    window.open(`${serverURL}/extension/${fileName}?${params}`, "_blank");
  };

  return (
    <Grid container direction="row-reverse" spacing={1} size={12}>
      {map(filteredSettings, ({ label, fileName }, index) => (
        <Grid key={label + index}>
          <StyledButton id={label} onClick={() => clickHandler(fileName)}>
            {label}
          </StyledButton>
        </Grid>
      ))}
    </Grid>
  );
};
