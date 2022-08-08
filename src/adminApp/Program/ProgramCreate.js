import { Redirect } from "react-router-dom";
import React, { useEffect, useReducer, useState } from "react";
import http from "common/utils/httpClient";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import Button from "@material-ui/core/Button";
import FormLabel from "@material-ui/core/FormLabel";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import { colorPickerCSS, programInitialState } from "../Constant";
import { programReducer } from "../Reducers";
import ColorPicker from "material-ui-rc-color-picker";
import "material-ui-rc-color-picker/assets/index.css";
import _ from "lodash";
import { findProgramEnrolmentForms, findProgramExitForms } from "../domain/formMapping";
import { DocumentationContainer } from "../../common/components/DocumentationContainer";
import { AvniTextField } from "../../common/components/AvniTextField";
import { AvniFormLabel } from "../../common/components/AvniFormLabel";
import { AvniSelectForm } from "../../common/components/AvniSelectForm";
import { AvniSelect } from "../../common/components/AvniSelect";
import MenuItem from "@material-ui/core/MenuItem";
import {
  sampleEnrolmentEligibilityCheckRule,
  sampleEnrolmentSummaryRule
} from "../../formDesigner/common/SampleRule";
import RuleDesigner from "../../formDesigner/components/DeclarativeRule/RuleDesigner";
import { confirmBeforeRuleEdit } from "../../formDesigner/util";
import ProgramService from "../service/ProgramService";

const ProgramCreate = props => {
  const [program, dispatch] = useReducer(programReducer, programInitialState);
  const [errors, setErrors] = useState(new Map());
  const [saved, setSaved] = useState(false);
  const [id, setId] = useState();
  const [subjectT, setSubjectT] = useState({});
  const [subjectType, setSubjectType] = useState([]);
  const [formList, setFormList] = useState([]);

  useEffect(() => {
    dispatch({ type: "setLoaded" });
    http
      .get("/web/operationalModules")
      .then(response => {
        setFormList(response.data.forms);
        setSubjectType(response.data.subjectTypes);
      })
      .catch(error => {});
  }, []);

  const onSubmit = event => {
    event.preventDefault();

    let [errors, jsCode] = ProgramService.validateProgram(program, subjectT);
    if (!_.isEmpty(jsCode) && _.isNil(errors.get("EnrolmentEligibilityCheckDeclarativeRule"))) {
      program.enrolmentEligibilityCheckRule = jsCode;
    }
    if (errors.size !== 0) {
      setErrors(errors);
      return;
    }

    ProgramService.saveProgram(program, subjectT).then(saveResponse => {
      setErrors(saveResponse.errors);
      setSaved(saveResponse.status === 200);
      if (saveResponse.errors.size() === 0) setId(saveResponse.id);
    });
  };

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <DocumentationContainer filename={"Program.md"}>
          <Title title={"Create Program "} />

          <div className="container" style={{ float: "left" }}>
            <form onSubmit={onSubmit}>
              <AvniTextField
                id="name"
                label="Name"
                autoComplete="off"
                required
                value={program.name}
                onChange={event => dispatch({ type: "name", payload: event.target.value })}
                toolTipKey={"APP_DESIGNER_PROGRAM_NAME"}
              />
              <div />
              {!_.isNil(errors.get("Name")) && (
                <FormLabel error style={{ marginTop: "10px", fontSize: "12px" }}>
                  Empty name is not allowed.
                </FormLabel>
              )}
              <p />
              <AvniSelect
                label="Select Subject Type *"
                value={_.isEmpty(subjectT) ? "" : subjectT}
                onChange={event => setSubjectT(event.target.value)}
                style={{ width: "200px" }}
                required
                options={subjectType.map(option => (
                  <MenuItem value={option} key={option.uuid}>
                    {option.name}
                  </MenuItem>
                ))}
                toolTipKey={"APP_DESIGNER_PROGRAM_SUBJECT_TYPE"}
              />
              <div />
              {!_.isNil(errors.get("SubjectType")) && (
                <FormLabel error style={{ marginTop: "10px", fontSize: "12px" }}>
                  Empty subject type is not allowed.
                </FormLabel>
              )}
              <p />
              <AvniFormLabel label={"Colour Picker"} toolTipKey={"APP_DESIGNER_PROGRAM_COLOR"} />
              <ColorPicker
                id="colour"
                label="Colour"
                style={colorPickerCSS}
                color={program.colour}
                onChange={color => dispatch({ type: "colour", payload: color.color })}
              />
              <br />
              <AvniTextField
                id="programsubjectlabel"
                label="Program Subject Label"
                autoComplete="off"
                value={program.programSubjectLabel}
                onChange={event =>
                  dispatch({ type: "programSubjectLabel", payload: event.target.value })
                }
                toolTipKey={"APP_DESIGNER_PROGRAM_SUBJECT_LABEL"}
              />
              <p />
              <AvniSelectForm
                label={"Select Enrolment Form"}
                value={_.get(program, "programEnrolmentForm.formName")}
                onChange={selectedForm =>
                  dispatch({
                    type: "programEnrolmentForm",
                    payload: selectedForm
                  })
                }
                formList={findProgramEnrolmentForms(formList)}
                toolTipKey={"APP_DESIGNER_PROGRAM_ENROLMENT_FORM"}
              />
              <p />
              <AvniSelectForm
                label={"Select Exit Form"}
                value={_.get(program, "programExitForm.formName")}
                onChange={selectedForm =>
                  dispatch({
                    type: "programExitForm",
                    payload: selectedForm
                  })
                }
                formList={findProgramExitForms(formList)}
                toolTipKey={"APP_DESIGNER_PROGRAM_EXIT_FORM"}
              />
              <p />
              <AvniFormLabel
                label={"Enrolment Summary Rule"}
                toolTipKey={"APP_DESIGNER_PROGRAM_SUMMARY_RULE"}
              />
              <Editor
                value={program.enrolmentSummaryRule || sampleEnrolmentSummaryRule()}
                onValueChange={event => dispatch({ type: "enrolmentSummaryRule", payload: event })}
                highlight={code => highlight(code, languages.js)}
                padding={10}
                style={{
                  fontFamily: '"Fira code", "Fira Mono", monospace',
                  fontSize: 15,
                  height: "auto",
                  borderStyle: "solid",
                  borderWidth: "1px"
                }}
              />
              <p />
              <AvniFormLabel
                label={"Enrolment Eligibility Check Rule"}
                toolTipKey={"APP_DESIGNER_PROGRAM_ELIGIBILITY_RULE"}
              />
              {program.loaded && (
                <RuleDesigner
                  rulesJson={program.enrolmentEligibilityCheckDeclarativeRule}
                  onValueChange={jsonData =>
                    dispatch({
                      type: "enrolmentEligibilityCheckDeclarativeRule",
                      payload: jsonData
                    })
                  }
                  updateJsCode={declarativeRuleHolder =>
                    dispatch({
                      type: "enrolmentEligibilityCheckRule",
                      payload: declarativeRuleHolder.generateEligibilityRule()
                    })
                  }
                  jsCode={program.enrolmentEligibilityCheckRule}
                  error={errors.get("EnrolmentEligibilityCheckDeclarativeRule")}
                  subjectType={subjectT}
                  getApplicableActions={state => state.getApplicableEnrolmentEligibilityActions()}
                  sampleRule={sampleEnrolmentEligibilityCheckRule()}
                  onJsCodeChange={event => {
                    confirmBeforeRuleEdit(
                      program.enrolmentEligibilityCheckDeclarativeRule,
                      () => dispatch({ type: "enrolmentEligibilityCheckRule", payload: event }),
                      () =>
                        dispatch({
                          type: "enrolmentEligibilityCheckDeclarativeRule",
                          payload: null
                        })
                    );
                  }}
                />
              )}
              <p />

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
