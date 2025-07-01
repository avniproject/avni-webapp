import React from "react";
import { map, filter, get } from "lodash";
import { makeStyles } from "@mui/styles";
import { Button, GridLegacy as Grid } from "@mui/material";
import { isDevEnv } from "../../../../../common/constants";
import { extensionScopeTypes } from "../../../../../formDesigner/components/Extensions/ExtensionReducer";
import commonApi from "../../../../../common/service";
import httpClient from "../../../../../common/utils/httpClient";

const useStyles = makeStyles(theme => ({
  buttonStyle: {
    textTransform: "none",
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    color: "#FFFFFF",
    backgroundColor: "#0000ff",
    "&:hover": {
      backgroundColor: "#0000A2"
    },
    marginBottom: theme.spacing(2)
  }
}));

export const ExtensionOption = ({ subjectUUIDs, typeUUID, typeName, scopeType, configExtensions }) => {
  const classes = useStyles();
  const [extensions, setExtensions] = React.useState([]);

  React.useEffect(() => {
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
    <Grid item container xs={12} direction={"row-reverse"} spacing={1}>
      {map(filteredSettings, ({ label, fileName }, index) => {
        return (
          <Grid item key={label + index}>
            <Button
              id={label}
              className={classes.buttonStyle}
              onClick={() => {
                clickHandler(fileName);
              }}
            >
              {label}
            </Button>
          </Grid>
        );
      })}
    </Grid>
  );
};
