import React from "react";
import { useSelector } from "react-redux";
import { selectPrintState } from "../../../../reducers/subjectDashboardReducer";
import { map } from "lodash";
import Fab from "@material-ui/core/Fab";
import { makeStyles } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import { cognitoInDev, devEnvUserName, isDevEnv } from "../../../../../common/constants";
import Auth from "@aws-amplify/auth";

const useStyles = makeStyles(theme => ({
  commentButton: {
    margin: theme.spacing(1),
    backgroundColor: "#f27510",
    height: "38px",
    zIndex: 1,
    boxShadow: "none",
    whiteSpace: "nowrap"
  }
}));

export const CustomPrintOption = ({ subjectUUID }) => {
  const classes = useStyles();
  const printSettings = useSelector(selectPrintState);
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
    <Grid item container xs={12} direction={"row-reverse"}>
      {map(printSettings, ({ label, fileName }, index) => {
        return (
          <Grid item key={label + index}>
            <Fab
              id={label}
              className={classes.commentButton}
              variant="extended"
              color="primary"
              aria-label="add"
              onClick={() => {
                clickHandler(fileName);
              }}
            >
              {label}
            </Fab>
          </Grid>
        );
      })}
    </Grid>
  );
};
