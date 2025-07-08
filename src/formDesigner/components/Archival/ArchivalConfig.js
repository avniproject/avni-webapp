import React, { useEffect, useReducer, useState } from "react";
import http from "../../../common/utils/httpClient";
import { Title } from "react-admin";
import Grid from "@material-ui/core/Grid";
import { DocumentationContainer } from "../../../common/components/DocumentationContainer";
import { Box, Input } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import { ArchivalConfigReducer } from "./ArchivalConfigReducer";
import { AvniFormLabel } from "../../../common/components/AvniFormLabel";
import CustomizedSnackbar from "../CustomizedSnackbar";
import _ from "lodash";

const initialState = {
  // sqlQuery: "",
  // realmQuery: "",
  // batchSize: null
};
export const ArchivalConfig = () => {
  const [archivalConfigState, dispatch] = useReducer(ArchivalConfigReducer, initialState);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    http.get("/web/syncConfig").then(response => dispatch({ type: "archivalConfig", payload: response.data || initialState }));
  }, []);

  const onSave = () => {
    if (_.isEmpty(archivalConfigState.sqlQuery)) {
      setError({ message: "SQL Query cannot be empty" });
      setShowSnackbar(true);
      return;
    }
    http
      .post("/web/syncConfig", archivalConfigState)
      .then(response => {
        dispatch({ type: "archivalConfig", payload: response.data });
        setError(null);
        setShowSnackbar(true);
      })
      .catch(e => {
        setError(e);
        setShowSnackbar(true);
        console.log(e);
      });
  };

  const errorMessage = `${_.get(error, "response.data")} (${_.get(error, "message")})`;
  return (
    <Box boxShadow={2} p={5} bgcolor="background.paper">
      <Title title="Sync Config" />
      <DocumentationContainer filename={"Sync.md"}>
        <div className="container">
          <Grid container direction={"column"} spacing={5}>
            <Grid item>
              <AvniFormLabel
                label={"Ids of individuals returned by the PostgreSQL query added here, will not be synced to mobile app users on fresh sync."}
                toolTipKey={"APP_DESIGNER_SYNC_SQL_QUERY"}
              />
              <br />
              <Input
                type="text"
                name="sqlQuery"
                value={archivalConfigState.sqlQuery}
                placeholder={"SQL Query"}
                style={{ width: "100%" }}
                multiline
                onChange={event => dispatch({ type: "sqlQuery", payload: { value: event.target.value } })}
              />
            </Grid>
            {/*Uncomment when realm query and batch size need to be supported*/}
            {/*<Grid item>*/}
            {/*  <AvniFormLabel label={"Realm Query to identify subjects to be removed from the mobile app"} toolTipKey={"APP_DESIGNER_SYNC_REALM_QUERY"} />*/}
            {/*  <Input type="text" name="realmQuery" value={archivalConfigState.realmQuery} placeholder={"Realm Query"}*/}
            {/*         style={{width: "100%"}}*/}
            {/*         multiline*/}
            {/*         onChange={event =>*/}
            {/*           dispatch({type: "realmQuery", payload: {value: event.target.value}})*/}
            {/*         }/>*/}
            {/*</Grid>*/}
            {/*<Grid item>*/}
            {/*  <AvniFormLabel label={"Maximum number of records to exclude at one time"} toolTipKey={"APP_DESIGNER_SYNC_BATCH_SIZE"} />*/}
            {/*  <Input type="text" name="batchSize" value={archivalConfigState.batchSize} placeholder={"Batch Size"}*/}
            {/*         onChange={event =>*/}
            {/*           dispatch({type: "batchSize", payload: {value: event.target.value}})*/}
            {/*         }/>*/}
            {/*</Grid>*/}
            <Grid item>
              <Button variant={"contained"} color={"primary"} onClick={onSave}>
                Save
              </Button>
            </Grid>
          </Grid>
        </div>
      </DocumentationContainer>
      {showSnackbar && (
        <CustomizedSnackbar
          getDefaultSnackbarStatus={status => setShowSnackbar(status)}
          variant={!_.isNil(error) ? "error" : "success"}
          message={!_.isNil(error) ? errorMessage : "Saved Sync Config"}
        />
      )}
    </Box>
  );
};
