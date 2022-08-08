import React, { useEffect, useReducer, useState } from "react";
import http from "common/utils/httpClient";
import { Redirect } from "react-router-dom";
import Box from "@material-ui/core/Box";
import { Title } from "react-admin";
import Button from "@material-ui/core/Button";
import FormLabel from "@material-ui/core/FormLabel";
import VisibilityIcon from "@material-ui/icons/Visibility";
import Grid from "@material-ui/core/Grid";
import DeleteIcon from "@material-ui/icons/Delete";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import { colorPickerCSS, programInitialState } from "../Constant";
import { programReducer } from "../Reducers";
import ColorPicker from "material-ui-rc-color-picker";
import "material-ui-rc-color-picker/assets/index.css";
import MenuItem from "@material-ui/core/MenuItem";
import _ from "lodash";
import {
  findProgramEnrolmentForm,
  findProgramEnrolmentForms,
  findProgramExitForm,
  findProgramExitForms
} from "../domain/formMapping";
import { SaveComponent } from "../../common/components/SaveComponent";
import { AvniTextField } from "../../common/components/AvniTextField";
import { AvniSelect } from "../../common/components/AvniSelect";
import { AvniFormLabel } from "../../common/components/AvniFormLabel";
import { AvniSelectForm } from "../../common/components/AvniSelectForm";
import { AvniSwitch } from "../../common/components/AvniSwitch";
import {
  sampleEnrolmentEligibilityCheckRule,
  sampleEnrolmentSummaryRule
} from "../../formDesigner/common/SampleRule";
import RuleDesigner from "../../formDesigner/components/DeclarativeRule/RuleDesigner";
import { confirmBeforeRuleEdit } from "../../formDesigner/util";
import ProgramService from "../service/ProgramService";

const ProgramEdit = props => {
  const [program, dispatch] = useReducer(programReducer, programInitialState);
  const [errors, setErrors] = useState(new Map());
  const [redirectShow, setRedirectShow] = useState(false);
  const [programData, setProgramData] = useState({});
  const [deleteAlert, setDeleteAlert] = useState(false);
  const [subjectT, setSubjectT] = useState({});
  const [formList, setFormList] = useState([]);
  const [subjectType, setSubjectType] = useState([]);

  useEffect(() => {
    http
      .get("/web/program/" + props.match.params.id)
      .then(response => response.data)
      .then(result => {
        setProgramData(result);
        dispatch({ type: "setData", payload: result });
        http
          .get("/web/operationalModules")
          .then(response => {
            const formMap = response.data.formMappings;
            formMap.map(l => (l["isVoided"] = false));
            setFormList(response.data.forms);
            setSubjectType(response.data.subjectTypes);
            const temp = response.data.formMappings.filter(l => l.programUUID === result.uuid);
            setSubjectT(
              response.data.subjectTypes.filter(l => l.uuid === temp[0].subjectTypeUUID)[0]
            );

            const enrolmentForm = findProgramEnrolmentForm(formMap, result);
            dispatch({ type: "programEnrolmentForm", payload: enrolmentForm });

            const exitForm = findProgramExitForm(formMap, result);
            dispatch({ type: "programExitForm", payload: exitForm });
          })
          .catch(error => {});
      });
  }, []);

  const onSubmit = () => {
    let [errors, jsCode] = ProgramService.validateProgram(program, subjectT);
    if (!_.isEmpty(jsCode) && _.isNil(errors.get("EnrolmentEligibilityCheckDeclarativeRule"))) {
      program.enrolmentEligibilityCheckRule = jsCode;
    }
    if (errors.size !== 0) {
      setErrors(errors);
      return;
    }

    ProgramService.saveProgram(program, subjectT, props.match.params.id).then(saveResponse => {
      setErrors(saveResponse.errors);
      setRedirectShow(saveResponse.status === 200);
    });
  };

  const onDelete = () => {
    if (window.confirm("Do you really want to delete program?")) {
      http
        .delete("/web/program/" + props.match.params.id)
        .then(response => {
          if (response.status === 200) {
            setDeleteAlert(true);
          }
        })
        .catch(error => {});
    }
  };

  return (
    <>
      <Box boxShadow={2} p={3} bgcolor="background.paper">
        <Title title={"Edit Program "} />
        <Grid container item sm={12} style={{ justifyContent: "flex-end" }}>
          <Button color="primary" type="button" onClick={() => setRedirectShow(true)}>
            <VisibilityIcon /> Show
          </Button>
        </Grid>
        <div className="container" style={{ float: "left" }}>
          <AvniTextField
            id="name"
            label="Name"
            autoComplete="off"
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
          <AvniSwitch
            checked={program.manualEligibilityCheckRequired}
            onChange={event =>
              dispatch({ type: "manualEligibilityCheckRequired", payload: event.target.checked })
            }
            name="Manual eligibility check required"
            toolTipKey={"APP_DESIGNER_PROGRAM_MANUAL_ELIGIBILITY_CHECK_REQUIRED"}
          />
          <p />
          <AvniSwitch
            checked={program.active}
            onChange={event => dispatch({ type: "active", payload: event.target.checked })}
            name="Active"
            toolTipKey={"APP_DESIGNER_PROGRAM_ACTIVE"}
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
                    dispatch({ type: "enrolmentEligibilityCheckDeclarativeRule", payload: null })
                );
              }}
            />
          )}
          <p />
        </div>
        <Grid container item sm={12}>
          <Grid item sm={1}>
            <SaveComponent name="save" onSubmit={onSubmit} styleClass={{ marginLeft: "14px" }} />
          </Grid>
          <Grid item sm={11}>
            <Button style={{ float: "right", color: "red" }} onClick={() => onDelete()}>
              <DeleteIcon /> Delete
            </Button>
          </Grid>
        </Grid>
      </Box>
      {redirectShow && <Redirect to={`/appDesigner/program/${props.match.params.id}/show`} />}
      {deleteAlert && <Redirect to="/appDesigner/program" />}
    </>
  );
};

export default ProgramEdit;
