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
    http.get("/web/archivalConfig").then(response => dispatch({ type: "archivalConfig", payload: response.data || initialState }));
  }, []);

  const onSave = () => {
    if (_.isEmpty(archivalConfigState.sqlQuery)) {
      setError({ message: "SQL Query cannot be empty" });
      setShowSnackbar(true);
      return;
    }
    http
      .post("/web/archivalConfig", archivalConfigState)
      .then(response => {
        dispatch({ type: "archivalConfig", payload: response.data });
        setShowSnackbar(true);
      })
      .catch(e => {
        setError(e);
        setShowSnackbar(true);
        console.log(e);
      });
  };

  return (
    <Box boxShadow={2} p={5} bgcolor="background.paper">
      <Title title="Archival Config" />
      <DocumentationContainer filename={"Archival.md"}>
        <div className="container">
          <Grid container direction={"column"} spacing={5}>
            <Grid item>
              <AvniFormLabel label={"SQL Query"} toolTipKey={"APP_DESIGNER_ARCHIVAL_SQL_QUERY"} />
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
            {/*<Grid item>*/}
            {/*  <AvniFormLabel label={"Realm Query"} toolTipKey={"APP_DESIGNER_NAME_HELP_TEXT"} />*/}
            {/*  <Input type="text" name="realmQuery" value={archivalConfigState.realmQuery} placeholder={"Realm Query"}*/}
            {/*         style={{width: "100%"}}*/}
            {/*         multiline*/}
            {/*         onChange={event =>*/}
            {/*           dispatch({type: "realmQuery", payload: {value: event.target.value}})*/}
            {/*         }/>*/}
            {/*</Grid>*/}
            {/*<Grid item>*/}
            {/*  <AvniFormLabel label={"Batch Size"} toolTipKey={"APP_DESIGNER_NAME_HELP_TEXT"} />*/}
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
          message={!_.isNil(error) ? error.message : "Saved Archival Config"}
        />
      )}
    </Box>
  );
};
