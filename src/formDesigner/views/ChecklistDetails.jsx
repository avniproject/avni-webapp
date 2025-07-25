import Box from "@mui/material/Box";
import { Grid } from "@mui/material";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { JsonEditor } from "../components/JsonEditor";
import _ from "lodash";
import FormLabel from "@mui/material/FormLabel";
import Button from "@mui/material/Button";
import { ValidationError } from "../components/ValidationError";
import api from "../api/ChecklistDetailsApi";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CustomizedSnackbar from "../components/CustomizedSnackbar";
import { Title } from "react-admin";
import { DocumentationContainer } from "../../common/components/DocumentationContainer";
import UserInfo from "../../common/model/UserInfo";
import { Privilege } from "openchs-models";
import Save from "@mui/icons-material/Save";

const ChecklistDetails = () => {
  const userInfo = useSelector(state => state.app.userInfo);

  const [checklistDetails, setChecklistDetails] = useState();
  const [validationErrors, setValidationErrors] = useState();
  const [foldCard, setFoldCard] = useState(true);
  const [disableSave, setDisableSave] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
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
    const [status, error] = await api.saveChecklistDetails(
      JSON.parse(checklistDetails)
    );
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
    <Box
      sx={{
        boxShadow: 2,
        p: 3,
        bgcolor: "background.paper"
      }}
    >
      <DocumentationContainer filename={"Checklist.md"}>
        <Title title={"Checklist"} />
        <Box
          sx={{
            boxShadow: 1,
            p: 1.5
          }}
        >
          <div
            style={{ cursor: "pointer" }}
            onClick={() => setFoldCard(!foldCard)}
          >
            {foldCard ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            <FormLabel style={{ fontSize: "16px", color: "black" }}>
              Checklist
            </FormLabel>
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
          <ValidationError
            validationError={getValidationErrorByKey("SERVER_ERROR")}
          />
        </Grid>
        {UserInfo.hasPrivilege(
          userInfo,
          Privilege.PrivilegeType.EditChecklistConfiguration
        ) && (
          <Button
            disabled={disableSave}
            color="primary"
            variant="contained"
            onClick={() => onSave()}
            style={{ marginTop: "14px" }}
            startIcon={<Save />}
          >
            Save
          </Button>
        )}
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

export default ChecklistDetails;
