import { useState, useReducer, useEffect, Fragment } from "react";
import {
  CustomCardConfigReducer,
  CustomCardConfigReducerKeys,
  initialCustomCardConfigState,
} from "./CustomCardConfigReducer";
import Box from "@mui/material/Box";
import { DocumentationContainer } from "../../../common/components/DocumentationContainer";
import { Grid } from "@mui/material";
import Button from "@mui/material/Button";
import { AvniTextField } from "../../../common/components/AvniTextField";
import { SaveComponent } from "../../../common/components/SaveComponent";
import { Title } from "react-admin";
import DeleteIcon from "@mui/icons-material/Delete";
import { Navigate, useParams } from "react-router-dom";
import { AvniFormLabel } from "../../../common/components/AvniFormLabel";
import { JSEditor } from "../../../common/components/JSEditor";
import CustomCardConfigService from "../../../common/service/CustomCardConfigService";
import { isEmpty, isNil } from "lodash";
import {
  createServerError,
  getErrorByKey,
  getServerError,
  hasServerError,
  removeServerError,
} from "../../common/ErrorUtil";
import CustomizedSnackbar from "../CustomizedSnackbar";

export const CreateEditCustomCardConfig = () => {
  const params = useParams();
  const edit = !isNil(params.id);
  const [config, dispatch] = useReducer(
    CustomCardConfigReducer,
    initialCustomCardConfigState,
  );
  const [error, setError] = useState([]);
  const [savedUuid, setSavedUuid] = useState();
  const [redirectAfterDelete, setRedirectAfterDelete] = useState(false);
  const [htmlFile, setHtmlFile] = useState();

  useEffect(() => {
    if (edit) {
      CustomCardConfigService.getByUuid(params.id).then((res) => {
        dispatch({ type: CustomCardConfigReducerKeys.setData, payload: res });
      });
    }
  }, []);

  const validate = () => {
    const errors = [];
    if (isEmpty(config.name)) {
      errors.push({ key: "EMPTY_NAME", message: "Name cannot be empty" });
    }
    if (!edit && !htmlFile && isEmpty(config.htmlFileS3Key)) {
      errors.push({
        key: "MISSING_HTML_FILE",
        message: "HTML file is required",
      });
    }
    setError(errors);
    return errors.length === 0;
  };

  const onSave = async () => {
    if (!validate()) return;
    try {
      const res = await CustomCardConfigService.save(config);
      const savedConfig = res.data;
      if (htmlFile) {
        await CustomCardConfigService.uploadHtml(savedConfig.uuid, htmlFile);
      }
      setSavedUuid(savedConfig.uuid);
    } catch (e) {
      setError([createServerError(e, "error while saving custom card config")]);
    }
  };

  const onDelete = () => {
    if (
      window.confirm("Do you really want to delete this custom card config?")
    ) {
      CustomCardConfigService.delete(params.id)
        .then(() => setRedirectAfterDelete(true))
        .catch((e) => {
          setError([createServerError(e, "error while deleting")]);
        });
    }
  };

  return (
    <Box sx={{ boxShadow: 2, p: 3, bgcolor: "background.paper" }}>
      <Title title={"Create Custom Card Config"} />
      <DocumentationContainer filename={"CustomCardConfig.md"}>
        <AvniTextField
          id="name"
          label="Name*"
          autoComplete="off"
          value={config.name}
          onChange={(event) =>
            dispatch({
              type: CustomCardConfigReducerKeys.name,
              payload: event.target.value,
            })
          }
          toolTipKey={"APP_DESIGNER_CUSTOM_CARD_CONFIG_NAME"}
        />
        {getErrorByKey(error, "EMPTY_NAME")}
        <p />
        <AvniFormLabel
          label="HTML File *"
          toolTipKey={"APP_DESIGNER_CUSTOM_CARD_CONFIG_HTML_FILE"}
        />
        <input
          type="file"
          accept=".html,text/html"
          onChange={(e) => setHtmlFile(e.target.files[0])}
        />
        {config.htmlFileS3Key && (
          <Fragment>
            <p />
            <span>Current: {config.htmlFileS3Key}</span>
          </Fragment>
        )}
        {getErrorByKey(error, "MISSING_HTML_FILE")}
        <p />
        <AvniFormLabel
          label={"Data Rule"}
          toolTipKey={"APP_DESIGNER_CUSTOM_CARD_CONFIG_DATA_RULE"}
        />
        <JSEditor
          value={config.dataRule || ""}
          onValueChange={(event) =>
            dispatch({
              type: CustomCardConfigReducerKeys.dataRule,
              payload: event,
            })
          }
        />
        <p />
        <Grid container direction={"row"}>
          <Grid size={1}>
            <SaveComponent name="save" onSubmit={onSave} />
          </Grid>
          <Grid size={11}>
            {edit && (
              <Button
                style={{ float: "right", color: "red" }}
                onClick={onDelete}
              >
                <DeleteIcon /> Delete
              </Button>
            )}
          </Grid>
        </Grid>
        {hasServerError(error) && (
          <CustomizedSnackbar
            message={getServerError(error).message}
            getDefaultSnackbarStatus={() => setError(removeServerError(error))}
            defaultSnackbarStatus={true}
            autoHideDuration={3000}
            variant={"error"}
          />
        )}
        {!isNil(savedUuid) && (
          <Navigate to={`/appDesigner/customCardConfig/${savedUuid}/show`} />
        )}
        {redirectAfterDelete && <Navigate to="/appDesigner/customCardConfig" />}
      </DocumentationContainer>
    </Box>
  );
};
