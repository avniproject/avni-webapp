import React, { Fragment } from "react";
import { Grid } from "@material-ui/core";
import MiddleText from "./MiddleText";
import InputField from "./InputField";
import { get, includes, map, zip } from "lodash";
import ConceptSearch from "./ConceptSearch";
import { inlineConceptDataType } from "../../common/constants";
import { Action } from "rules-config";
import { useDeclarativeRuleDispatch } from "./DeclarativeRuleContext";

const ActionDetailsComponent = ({
  selectedType,
  actionDetails,
  onActionChange,
  index,
  declarativeRuleIndex
}) => {
  const dispatch = useDeclarativeRuleDispatch();
  const actionTypes = Action.actionTypes;
  const selectedAnswersToSkipOptions = map(
    zip(actionDetails.answersToSkip, actionDetails.answerUuidsToSkip),
    ([name, uuid]) => ({ label: name, value: { name, uuid, toString: () => uuid } })
  );
  const onAnswerToSkipChange = labelValues => {
    dispatch({ type: "answerToSkipChange", payload: { declarativeRuleIndex, index, labelValues } });
  };

  return (
    <Fragment>
      {selectedType === actionTypes.Value && (
        <Grid item container xs={5} alignItems={"center"} direction={"row"} spacing={1}>
          <MiddleText text={"Is"} />
          <Grid item xs={11}>
            <InputField
              variant="outlined"
              value={get(actionDetails, "value")}
              onChange={event => onActionChange("value", event.target.value)}
            />
          </Grid>
        </Grid>
      )}
      {selectedType === actionTypes.SkipAnswers && (
        <Grid item xs={4}>
          <ConceptSearch
            key={index}
            isMulti={true}
            placeholder={"Type to search concept answers"}
            value={selectedAnswersToSkipOptions}
            onChange={labelValues => onAnswerToSkipChange(labelValues)}
            nonSupportedTypes={inlineConceptDataType}
          />
        </Grid>
      )}
      {includes([actionTypes.ValidationError, actionTypes.FormValidationError], selectedType) && (
        <Grid item container xs={8} alignItems={"center"} direction={"row"} spacing={1}>
          <MiddleText text={"Is"} />
          <Grid item xs={11}>
            <InputField
              variant="outlined"
              value={get(actionDetails, "validationError")}
              onChange={event => onActionChange("validationError", event.target.value)}
            />
          </Grid>
        </Grid>
      )}
    </Fragment>
  );
};

export default ActionDetailsComponent;
