import React from "react";
import { useDeclarativeRuleDispatch, useDeclarativeRuleState } from "./DeclarativeRuleContext";
import { map, startCase, get } from "lodash";
import { Grid } from "@material-ui/core";
import Select from "react-select";
import ActionDetailsComponent from "./ActionDetailsComponent";

const ActionComponent = ({
  action,
  index,
  declarativeRuleIndex,
  getApplicableActions,
  ...props
}) => {
  const dispatch = useDeclarativeRuleDispatch();
  const state = useDeclarativeRuleState();
  const types = map(getApplicableActions(state), (v, k) => ({
    value: v,
    label: startCase(k)
  }));
  const actionDetails = get(action, "details", {});
  const selectedType = get(action, "actionType");
  const onActionChange = (property, value) => {
    dispatch({
      type: "actionChange",
      payload: { declarativeRuleIndex, index, property, value, types }
    });
  };

  return (
    <Grid container direction={"row"} spacing={1} alignItems={"center"}>
      <Grid item xs={3}>
        <Select
          placeholder="Select action type"
          value={selectedType ? { value: selectedType, label: startCase(selectedType) } : null}
          options={types}
          style={{ width: "auto" }}
          onChange={event => onActionChange("actionType", get(event, "value", null))}
          isClearable={true}
        />
      </Grid>
      <ActionDetailsComponent
        index={index}
        declarativeRuleIndex={declarativeRuleIndex}
        actionDetails={actionDetails}
        onActionChange={onActionChange}
        selectedType={selectedType}
      />
    </Grid>
  );
};

export default ActionComponent;
