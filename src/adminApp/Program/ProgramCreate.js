import { Redirect } from "react-router-dom";
import React, { useEffect, useReducer, useState } from "react";
import http from "common/utils/httpClient";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import Button from "@material-ui/core/Button";
import { programInitialState } from "../Constant";
import { programReducer } from "../Reducers";
import "material-ui-rc-color-picker/assets/index.css";
import _ from "lodash";
import { DocumentationContainer } from "../../common/components/DocumentationContainer";
import ProgramService from "../service/ProgramService";
import EditProgramFields from "./EditProgramFields";

const ProgramCreate = props => {
  const [program, dispatch] = useReducer(programReducer, programInitialState);
  const [errors, setErrors] = useState(new Map());
  const [saved, setSaved] = useState(false);
  const [id, setId] = useState();
  const [subjectTypes, setSubjectTypes] = useState([]);
  const [subjectType, setSubjectType] = useState(null);
  const [formList, setFormList] = useState([]);

  useEffect(() => {
    dispatch({ type: "setLoaded" });
    http
      .get("/web/operationalModules")
      .then(response => {
        setFormList(response.data.forms);
        setSubjectTypes(response.data.subjectTypes);
      })
      .catch(error => {});
  }, []);

  const onSubmit = event => {
    event.preventDefault();

    let [errors, jsCodeEECDR, jsCodeMEECDR] = ProgramService.validateProgram(program, subjectType);
    ProgramService.updateJSRules(program, errors, jsCodeEECDR, jsCodeMEECDR);
    if (errors.size !== 0) {
      setErrors(errors);
      return;
    }

    ProgramService.saveProgram(program, subjectType).then(saveResponse => {
      setErrors(saveResponse.errors);
      setSaved(saveResponse.status === 200);
      if (saveResponse.errors.size === 0) setId(saveResponse.id);
    });
  };

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <DocumentationContainer filename={"Program.md"}>
          <Title title={"Create Program "} />

          <div className="container" style={{ float: "left" }}>
            <form onSubmit={onSubmit}>
              <EditProgramFields
                program={program}
                errors={errors}
                formList={formList}
                subjectTypes={subjectTypes}
                dispatch={dispatch}
                onSubjectTypeChange={setSubjectType}
                subjectType={subjectType}
              />
              <br />
              <br />
              <Button color="primary" variant="contained" type="submit">
                <i className="material-icons">save</i>Save
              </Button>
            </form>
          </div>
        </DocumentationContainer>
      </Box>
      {saved && <Redirect to={"/appDesigner/program/" + id + "/show"} />}
    </>
  );
};

export default ProgramCreate;
