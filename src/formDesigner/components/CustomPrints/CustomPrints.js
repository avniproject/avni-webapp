import React from "react";
import Box from "@material-ui/core/Box";
import { DocumentationContainer } from "../../../common/components/DocumentationContainer";
import { Title } from "react-admin";
import { LabelFileName } from "./LabelFileName";
import { checkForErrors, CustomPrintsReducer } from "./CustomPrintsReducer";
import { get, isEmpty, map } from "lodash";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import http from "common/utils/httpClient";
import CustomizedBackdrop from "../../../dataEntryApp/components/CustomizedBackdrop";
import { getErrorByKey } from "../../common/ErrorUtil";

const initialState = {
  labelFileNames: [],
  file: null,
  errors: []
};

const CustomPrints = () => {
  const [print, dispatch] = React.useReducer(CustomPrintsReducer, initialState);
  const [value, setValue] = React.useState("");
  const [load, setLoad] = React.useState(false);
  const { errors, file, labelFileNames } = print;

  React.useEffect(() => {
    http
      .fetchJson("/web/organisationConfig")
      .then(response => response.json)
      .then(res => {
        dispatch({ type: "setData", payload: get(res, "organisationConfig.prints", []) });
      });
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
      const printSettings = new Blob([JSON.stringify({ customPrintProperties: labelFileNames })], {
        type: "application/json"
      });
      formData.append("printSettings", printSettings);
      formData.append("file", file);
      http
        .post("/media/customPrint/upload", formData)
        .then(res => {
          if (res.status === 200) {
            setLoad(false);
          }
        })
        .catch(error => {
          setLoad(false);
          const errorMessage = `${get(error, "response.data") ||
            get(error, "message") ||
            "unknown error"}`;
          alert(`Error while uploading the data\n ${errorMessage}`);
          console.error(error);
        });
    } else {
      dispatch({ type: "setErrors", payload: errors });
    }
  };

  const renderSettings = () => {
    return map(labelFileNames, ({ label, fileName }, index) => (
      <LabelFileName dispatch={dispatch} label={label} fileName={fileName} index={index} />
    ));
  };

  return (
    <Box boxShadow={2} p={5} bgcolor="background.paper">
      <Title title="Custom Prints" />
      <DocumentationContainer filename={"Prints.md"}>
        <div className="container">
          <Grid container direction={"column"} spacing={5}>
            <Grid item>
              {renderSettings()}
              {getErrorByKey(errors, "EMPTY_SETTING")}
            </Grid>
            <Grid item>
              <Button color={"primary"} onClick={() => dispatch({ type: "newSetting" })}>
                Add more print Settings
              </Button>
            </Grid>
            <Grid contaner item direction={"column"}>
              <Grid item>
                <input type="file" value={value} onChange={onFileSelect} />
              </Grid>
              <Grid item>{getErrorByKey(errors, "EMPTY_FILE")}</Grid>
            </Grid>
            <Grid item>
              <Button variant={"contained"} color={"primary"} onClick={onSave}>
                Save
              </Button>
            </Grid>
          </Grid>
        </div>
        <CustomizedBackdrop load={!load} />
      </DocumentationContainer>
    </Box>
  );
};

export default CustomPrints;
