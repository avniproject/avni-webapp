import React from "react";
import Box from "@mui/material/Box";
import { DocumentationContainer } from "../../../common/components/DocumentationContainer";
import { Title } from "react-admin";
import { LabelFileName } from "./LabelFileName";
import { checkForErrors, ExtensionReducer, extensionScopeTypes } from "./ExtensionReducer";
import { get, isEmpty, map } from "lodash";
import { GridLegacy as Grid } from "@mui/material";
import Button from "@mui/material/Button";
import http from "common/utils/httpClient";
import CustomizedBackdrop from "../../../dataEntryApp/components/CustomizedBackdrop";
import { getErrorByKey } from "../../common/ErrorUtil";
import { connect } from "react-redux";
import UserInfo from "../../../common/model/UserInfo";
import { Privilege } from "openchs-models";

const initialState = {
  labelFileNames: [],
  file: null,
  errors: []
};

const Extensions = ({ userInfo }) => {
  const [print, dispatch] = React.useReducer(ExtensionReducer, initialState);
  const [value, setValue] = React.useState("");
  const [load, setLoad] = React.useState(false);
  const { errors, file, labelFileNames, scopeOptions } = print;

  React.useEffect(() => {
    http
      .fetchJson("/web/organisationConfig")
      .then(response => response.json)
      .then(res => {
        dispatch({ type: "setData", payload: get(res, "organisationConfig.extensions", []) });
      });
  }, []);

  React.useEffect(() => {
    http
      .fetchJson("/web/operationalModules")
      .then(response => response.json)
      .then(om => dispatch({ type: "setScopeOptions", payload: om }));
  }, []);

  const onFileSelect = event => {
    const fileReader = new FileReader();
    event.target.files[0] && fileReader.readAsText(event.target.files[0]);
    setValue(event.target.value);
    const file = event.target.files[0];
    fileReader.onloadend = event => {
      const error = dispatch({ type: "setFile", payload: file });
      error && alert(error);
    };
  };

  const onSave = () => {
    const errors = checkForErrors(print);
    if (isEmpty(errors)) {
      setLoad(true);
      let formData = new FormData();
      const extensionSettings = new Blob([JSON.stringify(labelFileNames)], {
        type: "application/json"
      });
      formData.append("extensionSettings", extensionSettings);
      formData.append("file", file);
      http
        .post("/extension/upload", formData)
        .then(res => {
          if (res.status === 200) {
            setLoad(false);
          }
        })
        .catch(error => {
          setLoad(false);
          const errorMessage = `${get(error, "response.data") || get(error, "message") || "unknown error"}`;
          alert(`Error while uploading the data\n ${errorMessage}`);
          console.error(error);
        });
    } else {
      dispatch({ type: "setErrors", payload: errors });
    }
  };

  const renderSettings = () => {
    const getScopeDisplayValue = ({ scopeType, name }) =>
      scopeType === extensionScopeTypes.subjectDashboard
        ? `${name} Dashboard`
        : scopeType === extensionScopeTypes.programEnrolment
        ? `${name} Program Enrolment`
        : name;
    const getOption = scope => ({ label: getScopeDisplayValue(scope), value: scope });
    const options = map(scopeOptions, scope => getOption(scope));
    return map(labelFileNames, ({ label, fileName, extensionScope }, index) => (
      <LabelFileName
        key={index}
        dispatch={dispatch}
        label={label}
        fileName={fileName}
        index={index}
        scope={isEmpty(extensionScope) ? "" : getOption(extensionScope)}
        options={options}
      />
    ));
  };

  return (
    <Box
      sx={{
        boxShadow: 2,
        p: 5,
        bgcolor: "background.paper"
      }}
    >
      <Title title="Extensions" />
      <DocumentationContainer filename={"Prints.md"}>
        <div className="container">
          <Grid container direction={"column"} spacing={5}>
            <Grid item>
              {renderSettings()}
              {getErrorByKey(errors, "EMPTY_SETTING")}
            </Grid>
            <Grid item>
              <Button color={"primary"} onClick={() => dispatch({ type: "newSetting" })}>
                Add more extensions
              </Button>
            </Grid>
            <Grid container item direction={"column"}>
              <Grid item>
                <input type="file" value={value} onChange={onFileSelect} />
              </Grid>
              <Grid item>{getErrorByKey(errors, "EMPTY_FILE")}</Grid>
            </Grid>
            {UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditExtension) && (
              <Grid item>
                <Button variant={"contained"} color={"primary"} onClick={onSave}>
                  Save
                </Button>
              </Grid>
            )}
          </Grid>
        </div>
        <CustomizedBackdrop load={!load} />
      </DocumentationContainer>
    </Box>
  );
};
const mapStateToProps = state => ({
  userInfo: state.app.userInfo
});
export default connect(mapStateToProps)(Extensions);
