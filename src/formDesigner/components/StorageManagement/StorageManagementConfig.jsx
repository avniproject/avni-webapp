import { useEffect, useReducer, useState } from "react";
import { httpClient as http } from "../../../common/utils/httpClient";
import { Title } from "react-admin";
import { Grid, Box, Input } from "@mui/material";
import { DocumentationContainer } from "../../../common/components/DocumentationContainer";
import Button from "@mui/material/Button";
import { StorageManagementConfigReducer } from "./StorageManagementConfigReducer";
import { AvniFormLabel } from "../../../common/components/AvniFormLabel";
import CustomizedSnackbar from "../CustomizedSnackbar";
import _ from "lodash";

const initialState = {
  // sqlQuery: "",
  // realmQuery: "",
  // batchSize: null
};
export const StorageManagementConfig = () => {
  const [storageManagementConfigState, dispatch] = useReducer(
    StorageManagementConfigReducer,
    initialState
  );
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    http.get("/web/storageManagementConfig").then(response =>
      dispatch({
        type: "storageManagementConfig",
        payload: response.data || initialState
      })
    );
  }, []);

  const onSave = () => {
    if (_.isEmpty(storageManagementConfigState.sqlQuery)) {
      setError({ message: "SQL Query cannot be empty" });
      setShowSnackbar(true);
      return;
    }
    http
      .post("/web/storageManagementConfig", storageManagementConfigState)
      .then(response => {
        dispatch({ type: "storageManagementConfig", payload: response.data });
        setError(null);
        setShowSnackbar(true);
      })
      .catch(e => {
        setError(e);
        setShowSnackbar(true);
        console.log(e);
      });
  };

  const errorMessage = `${_.get(error, "response.data")} (${_.get(
    error,
    "message"
  )})`;
  return (
    <Box
      sx={{
        boxShadow: 2,
        p: 5,
        bgcolor: "background.paper"
      }}
    >
      <Title title="App Storage Config" />
      <DocumentationContainer filename={"StorageManagementConfig.md"}>
        <div className="container">
          <Grid container direction={"column"} spacing={5}>
            <Grid>
              <AvniFormLabel
                label={
                  "SQL Query to identify subjects (via id) to be excluded from sync."
                }
                toolTipKey={"APP_DESIGNER_STORAGE_MANAGEMENT_SQL_QUERY"}
              />
              <br />
              <Input
                type="text"
                name="sqlQuery"
                value={storageManagementConfigState.sqlQuery}
                placeholder={"SQL Query"}
                style={{ width: "100%" }}
                multiline
                onChange={event =>
                  dispatch({
                    type: "sqlQuery",
                    payload: { value: event.target.value }
                  })
                }
              />
            </Grid>
            {/*Uncomment when realm query and batch size need to be supported*/}
            {/*<Grid>*/}
            {/*  <AvniFormLabel label={"Realm Query to identify subjects to be removed from the mobile app"} toolTipKey={"APP_DESIGNER_STORAGE_MANAGEMENT_REALM_QUERY"} />*/}
            {/*  <Input type="text" name="realmQuery" value={storageManagementConfigState.realmQuery} placeholder={"Realm Query"}*/}
            {/*         style={{width: "100%"}}*/}
            {/*         multiline*/}
            {/*         onChange={event =>*/}
            {/*           dispatch({type: "realmQuery", payload: {value: event.target.value}})*/}
            {/*         }/>*/}
            {/*</Grid>*/}
            {/*<Grid>*/}
            {/*  <AvniFormLabel label={"Maximum number of records to exclude at one time"} toolTipKey={"APP_DESIGNER_STORAGE_MANAGEMENT_BATCH_SIZE"} />*/}
            {/*  <Input type="text" name="batchSize" value={storageManagementConfigState.batchSize} placeholder={"Batch Size"}*/}
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
          message={!_.isNil(error) ? errorMessage : "Saved App Storage Config"}
        />
      )}
    </Box>
  );
};
