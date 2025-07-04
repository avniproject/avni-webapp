import React, { useEffect, useReducer, useState } from "react";
import { httpClient as http } from "../../../common/utils/httpClient";
import { Title } from "react-admin";
import { Grid } from "@mui/material";
import { DocumentationContainer } from "../../../common/components/DocumentationContainer";
import { Box, Input } from "@mui/material";
import Button from "@mui/material/Button";
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
    <Box
      sx={{
        boxShadow: 2,
        p: 5,
        bgcolor: "background.paper"
      }}
    >
      <Title title="Archival Config" />
      <DocumentationContainer filename={"Archival.md"}>
        <div className="container">
          <Grid container direction={"column"} spacing={5}>
            <Grid>
              <AvniFormLabel
                label={"SQL Query to identify subjects (via id) to be excluded from sync."}
                toolTipKey={"APP_DESIGNER_ARCHIVAL_SQL_QUERY"}
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
            {/*<Grid>*/}
            {/*  <AvniFormLabel label={"Realm Query to identify subjects to be removed from the mobile app"} toolTipKey={"APP_DESIGNER_ARCHIVAL_REALM_QUERY"} />*/}
            {/*  <Input type="text" name="realmQuery" value={archivalConfigState.realmQuery} placeholder={"Realm Query"}*/}
            {/*         style={{width: "100%"}}*/}
            {/*         multiline*/}
            {/*         onChange={event =>*/}
            {/*           dispatch({type: "realmQuery", payload: {value: event.target.value}})*/}
            {/*         }/>*/}
            {/*</Grid>*/}
            {/*<Grid>*/}
            {/*  <AvniFormLabel label={"Maximum number of records to exclude at one time"} toolTipKey={"APP_DESIGNER_ARCHIVAL_BATCH_SIZE"} />*/}
            {/*  <Input type="text" name="batchSize" value={archivalConfigState.batchSize} placeholder={"Batch Size"}*/}
            {/*         onChange={event =>*/}
            {/*           dispatch({type: "batchSize", payload: {value: event.target.value}})*/}
            {/*         }/>*/}
            {/*</Grid>*/}
            <Grid>
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
          message={!_.isNil(error) ? errorMessage : "Saved Archival Config"}
        />
      )}
    </Box>
  );
};
