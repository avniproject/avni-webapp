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
    initialState,
  );
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [successMessage, setSuccessMessage] = useState(
    "Saved App Storage Config",
  );
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);
  useEffect(() => {
    http.get("/web/storageManagementConfig").then((response) =>
      dispatch({
        type: "storageManagementConfig",
        payload: response.data || initialState,
      }),
    );
  }, []);

  const onSave = () => {
    if (isPending) return;
    if (_.isEmpty(storageManagementConfigState.sqlQuery)) {
      setError({ message: "SQL Query cannot be empty" });
      setShowSnackbar(true);
      return;
    }
    setIsPending(true);
    http
      .post("/web/storageManagementConfig", storageManagementConfigState)
      .then((response) => {
        dispatch({ type: "storageManagementConfig", payload: response.data });
        setError(null);
        setSuccessMessage("Saved App Storage Config");
        setShowSnackbar(true);
      })
      .catch((e) => {
        setError(e);
        setShowSnackbar(true);
        console.log(e);
      })
      .finally(() => {
        setIsPending(false);
      });
  };

  const onRemove = () => {
    if (isPending) return;
    setIsPending(true);
    http
      .post("/web/storageManagementConfig", {
        ...storageManagementConfigState,
        isVoided: true,
      })
      .then(() => {
        dispatch({ type: "reset" });
        setError(null);
        setSuccessMessage("Removed App Storage Config");
        setShowSnackbar(true);
      })
      .catch((e) => {
        setError(e);
        setShowSnackbar(true);
        console.log(e);
      })
      .finally(() => {
        setIsPending(false);
      });
  };

  const hasSavedConfig = Boolean(
    (storageManagementConfigState.id || storageManagementConfigState.uuid) &&
      !storageManagementConfigState.isVoided &&
      !storageManagementConfigState.voided,
  );

  const responseData =
    typeof _.get(error, "response.data") === "string"
      ? _.get(error, "response.data")
      : _.get(error, "response.data.message");
  const message = _.get(error, "message");
  const errorMessage = responseData ? `${responseData} (${message})` : message;
  return (
    <Box
      sx={{
        boxShadow: 2,
        p: 5,
        bgcolor: "background.paper",
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
                value={storageManagementConfigState.sqlQuery || ""}
                placeholder={"SQL Query"}
                style={{ width: "100%" }}
                multiline
                onChange={(event) =>
                  dispatch({
                    type: "sqlQuery",
                    payload: { value: event.target.value },
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
            <Grid container direction={"row"} spacing={2}>
              <Grid>
                <Button
                  variant={"contained"}
                  color={"primary"}
                  onClick={onSave}
                  disabled={isPending}
                >
                  Save
                </Button>
              </Grid>
              <Grid>
                <Button
                  variant={"outlined"}
                  color={"error"}
                  onClick={onRemove}
                  disabled={!hasSavedConfig || isPending}
                >
                  Remove
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </DocumentationContainer>
      {showSnackbar && (
        <CustomizedSnackbar
          getDefaultSnackbarStatus={(status) => setShowSnackbar(status)}
          variant={!_.isNil(error) ? "error" : "success"}
          message={!_.isNil(error) ? errorMessage : successMessage}
        />
      )}
    </Box>
  );
};
