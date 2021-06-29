import React from "react";
import { useSelector } from "react-redux";
import { selectPrintState } from "../../../../reducers/subjectDashboardReducer";
import { map, filter } from "lodash";
import { Button, makeStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { cognitoInDev, devEnvUserName, isDevEnv } from "../../../../../common/constants";
import Auth from "@aws-amplify/auth";

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

export const CustomPrintOption = ({ subjectUUID, typeUUID, typeName, scopeType }) => {
  const classes = useStyles();
  const printSettings = useSelector(selectPrintState);
  const filteredSettings = filter(
    printSettings,
    ({ printScope }) =>
      typeUUID === printScope.uuid &&
      typeName === printScope.name &&
      scopeType === printScope.scopeType
  );
  const serverURL = isDevEnv ? "http://localhost:8021" : window.location.origin;

  const clickHandler = async fileName => {
    let token = "";
    if (!isDevEnv || cognitoInDev) {
      const currentSession = await Auth.currentSession();
      token = `AUTH-TOKEN=${currentSession.idToken.jwtToken}`;
    } else {
      token = `user-name=${devEnvUserName}`;
    }
    const params = `subjectUUID=${subjectUUID}&${token}`;
    window.open(`${serverURL}/customPrint/${fileName}?${params}`, "_blank");
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
