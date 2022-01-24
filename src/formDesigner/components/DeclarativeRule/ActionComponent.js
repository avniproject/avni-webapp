import React from "react";
import { useDeclarativeRuleDispatch, useDeclarativeRuleState } from "./DeclarativeRuleContext";
import { map, startCase, get } from "lodash";
import { Action } from "rules-config";
import { Grid } from "@material-ui/core";
import Select from "react-select";
import { inlineConceptDataType } from "../../common/constants";
import ConceptSearch from "./ConceptSearch";
import InputField from "./InputField";
import MiddleText from "./MiddleText";

const ActionComponent = ({ action, index, declarativeRuleIndex, ...props }) => {
  const dispatch = useDeclarativeRuleDispatch();
  const state = useDeclarativeRuleState();
  const types = map(state.getApplicableViewFilterActions(), (v, k) => ({
    value: v,
    label: startCase(k)
  }));
  const selectedType = get(action, "actionType");
  const selectedAnswersToSkipOptions = map(action.answersToSkip, name => ({
    label: name,
    value: { name, toString: () => name }
  }));

  const onActionChange = (property, value) => {
    dispatch({ type: "actionChange", payload: { declarativeRuleIndex, index, property, value } });
  };

  const onAnswerToSkipChange = (property, labelValues) => {
    const value = map(labelValues, ({ label }) => label);
    dispatch({ type: "actionChange", payload: { declarativeRuleIndex, index, property, value } });
  };

  return (
    <Grid container xs={12} direction={"row"} spacing={1} alignItems={"center"}>
      <Grid item xs={3}>
        <Select
          placeholder="Select action type"
          value={selectedType ? { value: selectedType, label: startCase(selectedType) } : null}
          options={types}
          style={{ width: "auto" }}
          onChange={event => onActionChange("actionType", event.value)}
        />
      </Grid>
      {selectedType === Action.actionTypes.Value && (
        <Grid item container xs={3} alignItems={"center"}>
          <MiddleText text={"Is"} />
          <Grid item>
            <InputField
              variant="outlined"
              value={get(action, "value")}
              onChange={event => onActionChange("value", event.target.value)}
            />
          </Grid>
        </Grid>
      )}
      {selectedType === Action.actionTypes.SkipAnswers && (
        <Grid item xs={3}>
          <ConceptSearch
            key={index}
            isMulti={true}
            placeholder={"Type to search concept answers"}
            value={selectedAnswersToSkipOptions}
            onChange={event => onAnswerToSkipChange("answersToSkip", event)}
            nonSupportedTypes={inlineConceptDataType}
          />
        </Grid>
      )}
      {selectedType === Action.actionTypes.ValidationError && (
        <Grid item container xs={8} alignItems={"center"}>
          <MiddleText text={"Is"} />
          <Grid item>
            <InputField
              fullWidth
              variant="outlined"
              value={get(action, "validationError")}
              onChange={event => onActionChange("validationError", event.target.value)}
            />
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

export default ActionComponent;
