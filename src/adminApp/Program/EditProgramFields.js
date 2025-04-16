import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { AvniTextField } from "../../common/components/AvniTextField";
import _ from "lodash";
import FormLabel from "@material-ui/core/FormLabel";
import { AvniSelect } from "../../common/components/AvniSelect";
import MenuItem from "@material-ui/core/MenuItem";
import { AvniFormLabel } from "../../common/components/AvniFormLabel";
import { AvniSelectForm } from "../../common/components/AvniSelectForm";
import { findProgramEnrolmentForms, findProgramExitForms } from "../domain/formMapping";
import { AvniSwitch } from "../../common/components/AvniSwitch";
import {
  sampleEnrolmentEligibilityCheckRule,
  sampleEnrolmentSummaryRule,
  sampleManualEnrolmentEligibilityCheckRule
} from "../../formDesigner/common/SampleRule";
import RuleDesigner from "../../formDesigner/components/DeclarativeRule/RuleDesigner";
import { confirmBeforeRuleEdit } from "../../formDesigner/util";
import { JSEditor } from "../../common/components/JSEditor";
import { PopoverColorPicker } from "../../common/components/PopoverColorPicker";

const EditProgramFields = props => {
  const { program, errors, subjectTypes, formList, dispatch, onSubjectTypeChange, subjectType } = props;
  const [showGrowthChart, setShowGrowthChart] = useState(!!program.showGrowthChart);
  const isNew = _.isNil(program.uuid);
  const isChildOrPhulwari = programName =>
    programName && (programName.toLowerCase() === "child" || programName.toLowerCase() === "phulwari");

  useEffect(() => {
    if (isNew && isChildOrPhulwari(program.name) && !showGrowthChart) {
      setShowGrowthChart(true);
      dispatch({ type: "showGrowthChart", payload: true });
    }
  }, [program.name, showGrowthChart]);

  return (
    <>
      <AvniTextField
        id="name"
        label="Name"
        autoComplete="off"
        required
        value={program.name}
        onChange={event => dispatch({ type: "name", payload: event.target.value })}
        toolTipKey={"APP_DESIGNER_PROGRAM_NAME"}
      />
      <br />
      {!_.isNil(errors.get("Name")) && (
        <FormLabel error style={{ marginTop: "10px", fontSize: "12px" }}>
          Empty name is not allowed.
        </FormLabel>
      )}

      <AvniSelect
        label="Select Subject Type *"
        value={_.isEmpty(subjectType) ? "" : subjectType}
        onChange={event => onSubjectTypeChange(event.target.value)}
        style={{ width: "200px" }}
        required
        options={subjectTypes.map(option => (
          <MenuItem value={option} key={option.uuid}>
            {option.name}
          </MenuItem>
        ))}
        toolTipKey={"APP_DESIGNER_PROGRAM_SUBJECT_TYPE"}
      />
      {!_.isNil(errors.get("SubjectType")) && (
        <FormLabel error style={{ marginTop: "10px", fontSize: "12px" }}>
          Empty subject type is not allowed.
        </FormLabel>
      )}

      <br />
      <AvniFormLabel label={"Colour Picker"} toolTipKey={"APP_DESIGNER_PROGRAM_COLOR"} />
      <PopoverColorPicker
        id="colour"
        label="Colour"
        color={program.colour}
        onChange={color => dispatch({ type: "colour", payload: color })}
      />

      <br />
      <br />
      <AvniTextField
        id="programSubjectLabel"
        label="Program subject label"
        autoComplete="off"
        value={program.programSubjectLabel}
        onChange={event => dispatch({ type: "programSubjectLabel", payload: event.target.value })}
        toolTipKey={"APP_DESIGNER_PROGRAM_SUBJECT_LABEL"}
      />

      <br />
      <AvniSelectForm
        label={"Select enrolment form"}
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

      <br />
      <AvniSelectForm
        label={"Select exit form"}
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

      <br />
      <AvniSwitch
        checked={program.allowMultipleEnrolments}
        onChange={event => dispatch({ type: "allowMultipleEnrolments", payload: event.target.checked })}
        name="Allow multiple enrolments"
        toolTipKey={"APP_DESIGNER_ALLOW_MULTIPLE_ENROLMENTS"}
      />

      <br />
      <AvniSwitch
        checked={program.allow}
        onChange={event => dispatch({ type: "manualEligibilityCheckRequired", payload: event.target.checked })}
        name="Manual eligibility check required"
        toolTipKey={"APP_DESIGNER_PROGRAM_MANUAL_ELIGIBILITY_CHECK_REQUIRED"}
      />

      <AvniSwitch
        checked={showGrowthChart}
        onChange={event => {
          setShowGrowthChart(event.target.checked);
          dispatch({ type: "showGrowthChart", payload: event.target.checked });
        }}
        name="Show growth chart"
        disabled={isChildOrPhulwari(program.name)}
        toolTipKey={"APP_DESIGNER_PROGRAM_SHOW_GROWTH_CHART"}
      />
      <br />

      <br />
      <AvniFormLabel label={"Enrolment Summary Rule"} toolTipKey={"APP_DESIGNER_PROGRAM_SUMMARY_RULE"} />
      <JSEditor
        value={program.enrolmentSummaryRule || sampleEnrolmentSummaryRule()}
        onValueChange={event => dispatch({ type: "enrolmentSummaryRule", payload: event })}
      />

      <br />
      <br />
      <AvniFormLabel label={"Enrolment eligibility check rule"} toolTipKey={"APP_DESIGNER_PROGRAM_ELIGIBILITY_RULE"} />
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
          subjectType={subjectType}
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

      <br />
      <br />
      <AvniFormLabel
        label={"Manual enrolment eligibility check rule"}
        toolTipKey={"APP_DESIGNER_MANUAL_ENROLMENT_ELIGIBILITY_CHECK_RULE"}
      />
      {program.loaded && (
        <JSEditor
          value={program.manualEnrolmentEligibilityCheckRule || sampleManualEnrolmentEligibilityCheckRule()}
          onValueChange={event => dispatch({ type: "manualEnrolmentEligibilityCheckRule", payload: event })}
        />
      )}
    </>
  );
};

EditProgramFields.propTypes = {
  program: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  subjectTypes: PropTypes.array.isRequired,
  formList: PropTypes.array.isRequired,
  dispatch: PropTypes.func.isRequired,
  subjectType: PropTypes.object,
  onSubjectTypeChange: PropTypes.func.isRequired
};

export default EditProgramFields;
