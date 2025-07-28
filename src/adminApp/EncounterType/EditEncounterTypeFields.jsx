import { AvniTextField } from "../../common/components/AvniTextField";
import { AvniSelect } from "../../common/components/AvniSelect";
import _ from "lodash";
import { Box, MenuItem } from "@mui/material";
import { AvniSwitch } from "../../common/components/AvniSwitch";
import { AvniSelectForm } from "../../common/components/AvniSelectForm";
import { AvniFormLabel } from "../../common/components/AvniFormLabel";
import RuleDesigner from "../../formDesigner/components/DeclarativeRule/RuleDesigner";
import { sampleEncounterEligibilityCheckRule } from "../../formDesigner/common/SampleRule";
import { confirmBeforeRuleEdit } from "../../formDesigner/util";
import { useEffect } from "react";
import {
  findEncounterCancellationForms,
  findEncounterForms,
  findProgramEncounterCancellationForms,
  findProgramEncounterForms
} from "../domain/formMapping";

const EditEncounterTypeFields = ({
  encounterType,
  dispatch,
  subjectT,
  setSubjectT,
  subjectType,
  programT,
  updateProgram,
  program,
  formList,
  ruleValidationError,
  formMappings,
  setProgram,
  allPrograms
}) => {
  function getCancellationForms() {
    return _.isEmpty(programT)
      ? findEncounterCancellationForms(formList)
      : findProgramEncounterCancellationForms(formList);
  }

  function getEncounterForms() {
    return _.isEmpty(programT)
      ? findEncounterForms(formList)
      : findProgramEncounterForms(formList);
  }

  useEffect(() => {
    if (!_.isEmpty(subjectT)) {
      const matchingFormMappings = formMappings.filter(
        formMapping =>
          formMapping.subjectTypeUUID === subjectT.uuid &&
          !_.isNil(formMapping.programUUID)
      );
      setProgram(
        allPrograms.filter(program =>
          _.includes(
            matchingFormMappings.map(formMapping => formMapping.programUUID),
            program.uuid
          )
        )
      );
    }
  }, [subjectT]);

  return (
    <div>
      <AvniTextField
        id="name"
        label="Name*"
        autoComplete="off"
        value={encounterType.name}
        onChange={event =>
          dispatch({ type: "name", payload: event.target.value })
        }
        toolTipKey={"APP_DESIGNER_ENCOUNTER_TYPE_NAME"}
      />
      <p />
      <AvniSelect
        label="Select subject type *"
        value={_.isEmpty(subjectT) ? "" : subjectT}
        onChange={event => setSubjectT(event.target.value)}
        style={{ width: "200px" }}
        required
        options={subjectType.map(option => (
          <MenuItem value={option} key={option.uuid}>
            {option.name}
          </MenuItem>
        ))}
        toolTipKey={"APP_DESIGNER_ENCOUNTER_TYPE_SUBJECT"}
      />
      <p />
      <AvniSelect
        label="Select Program"
        value={_.isEmpty(programT) ? "" : programT}
        onChange={event => updateProgram(event.target.value)}
        style={{ width: "200px" }}
        options={program.map(option => (
          <MenuItem value={option} key={option.uuid}>
            {option.name}
          </MenuItem>
        ))}
        toolTipKey={"APP_DESIGNER_ENCOUNTER_TYPE_PROGRAM"}
        isClearable={true}
      />
      <p />
      <AvniSelectForm
        label={"Select Encounter Form"}
        value={_.get(encounterType, "programEncounterForm.formName")}
        onChange={selectedForm =>
          dispatch({
            type: "programEncounterForm",
            payload: selectedForm
          })
        }
        formList={getEncounterForms()}
        toolTipKey={"APP_DESIGNER_ENCOUNTER_TYPE_FORM"}
      />
      <p />
      <AvniSelectForm
        label={"Select Encounter Cancellation Form"}
        value={_.get(
          encounterType,
          "programEncounterCancellationForm.formName"
        )}
        onChange={selectedForm =>
          dispatch({
            type: "programEncounterCancellationForm",
            payload: selectedForm
          })
        }
        formList={getCancellationForms()}
        toolTipKey={"APP_DESIGNER_ENCOUNTER_TYPE_CANCELLATION_FORM"}
      />
      <p />
      <AvniFormLabel
        label={"Encounter Eligibility Check Rule"}
        toolTipKey={"APP_DESIGNER_ENCOUNTER_TYPE_ELIGIBILITY_RULE"}
      />
      {encounterType.loaded && (
        <Box sx={{ maxWidth: "75%" }}>
          <RuleDesigner
            rulesJson={encounterType.encounterEligibilityCheckDeclarativeRule}
            onValueChange={jsonData =>
              dispatch({
                type: "encounterEligibilityCheckDeclarativeRule",
                payload: jsonData
              })
            }
            updateJsCode={declarativeRuleHolder =>
              dispatch({
                type: "encounterEligibilityCheckRule",
                payload: declarativeRuleHolder.generateEligibilityRule()
              })
            }
            jsCode={encounterType.encounterEligibilityCheckRule}
            error={ruleValidationError}
            subjectType={subjectT}
            getApplicableActions={state =>
              state.getApplicableEncounterEligibilityActions()
            }
            sampleRule={sampleEncounterEligibilityCheckRule()}
            onJsCodeChange={event => {
              confirmBeforeRuleEdit(
                encounterType.encounterEligibilityCheckDeclarativeRule,
                () =>
                  dispatch({
                    type: "encounterEligibilityCheckRule",
                    payload: event
                  }),
                () =>
                  dispatch({
                    type: "encounterEligibilityCheckDeclarativeRule",
                    payload: null
                  })
              );
            }}
          />
        </Box>
      )}
      <p />
      <AvniSwitch
        toolTipKey={"APP_DESIGNER_ENCOUNTER_TYPE_IMMUTABLE"}
        name={"Immutable"}
        onChange={e =>
          dispatch({
            type: "setImmutable",
            payload: e.target.checked
          })
        }
        checked={!!encounterType.immutable}
      />
      <p />
      <div />
    </div>
  );
};

export default EditEncounterTypeFields;
