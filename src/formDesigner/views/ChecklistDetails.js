import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import React from "react";
import { JsonEditor } from "../components/JsonEditor";
import _ from "lodash";
import FormLabel from "@material-ui/core/FormLabel";
import Button from "@material-ui/core/Button";
import { ValidationError } from "../components/ValidationError";
import api from "../api/ChecklistDetailsApi";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import CustomizedSnackbar from "../components/CustomizedSnackbar";
import { Title } from "react-admin";
import { DocumentationContainer } from "../../common/components/DocumentationContainer";

export const ChecklistDetails = () => {
  const [checklistDetails, setChecklistDetails] = React.useState();
  const [validationErrors, setValidationErrors] = React.useState();
  const [foldCard, setFoldCard] = React.useState(true);
  const [disableSave, setDisableSave] = React.useState(true);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    api.getChecklistDetails().then(({ json }) => {
      const details = _.map(json, j => JSON.stringify(j, null, 4));
      setChecklistDetails(_.isEmpty(details) ? "" : details[0]);
    });
  }, []);

  const validateJSON = valueString => {
    try {
      JSON.parse(valueString);
      setValidationErrors([]);
    } catch (e) {
      setValidationErrors([{ key: "JSON_ERROR", message: "Not a valid JSON" }]);
    }
  };

  const getValidationErrorByKey = errorKey =>
    _.find(validationErrors, ({ key }) => key === errorKey);

  const onSave = async () => {
    if (!_.isEmpty(getValidationErrorByKey("JSON_ERROR"))) {
      return;
    }
    const [status, error] = await api.saveChecklistDetails(JSON.parse(checklistDetails));
    !_.isNil(error)
      ? setValidationErrors([{ key: "SERVER_ERROR", message: error }])
      : setValidationErrors([]);
    if (status === 201) {
      setSuccess(true);
      setFoldCard(true);
      setDisableSave(true);
    }
  };

  const onChange = event => {
    validateJSON(event);
    setChecklistDetails(event);
    setDisableSave(false);
  };

  return (
    <Box boxShadow={2} p={3} bgcolor="background.paper">
      <DocumentationContainer filename={"Checklist.md"}>
        <Title title={"Checklist"} />
        <Box boxShadow={1} p={1.5}>
          <div style={{ cursor: "pointer" }} onClick={() => setFoldCard(!foldCard)}>
            {foldCard ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            <FormLabel style={{ fontSize: "16px", color: "black" }}>Checklist</FormLabel>
          </div>
          {foldCard ? null : (
            <JsonEditor
              value={checklistDetails}
              onChange={event => onChange(event)}
              validationError={getValidationErrorByKey("JSON_ERROR")}
            />
          )}
        </Box>
        <Grid>
          <ValidationError validationError={getValidationErrorByKey("SERVER_ERROR")} />
        </Grid>
        <Button
          disabled={disableSave}
          color="primary"
          variant="contained"
          onClick={() => onSave()}
          style={{ marginTop: "14px" }}
        >
          <i className="material-icons">save</i>Save
        </Button>
        {success && (
          <CustomizedSnackbar
            message="Successfully saved the checklist"
            getDefaultSnackbarStatus={setSuccess}
            defaultSnackbarStatus={success}
          />
        )}
      </DocumentationContainer>
    </Box>
  );
};
