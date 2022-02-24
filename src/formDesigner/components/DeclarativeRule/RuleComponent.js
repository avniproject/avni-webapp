import React from "react";
import LHSComponent from "./LHSComponent";
import RHSComponent from "./RHSComponent";
import OperatorComponent from "./OperatorComponent";
import Grid from "@material-ui/core/Grid";
import { Box } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import DeleteIcon from "@material-ui/icons/Delete";
import Colors from "../../../dataEntryApp/Colors";
import { useDeclarativeRuleDispatch } from "./DeclarativeRuleContext";
import MiddleText from "./MiddleText";

const RuleComponent = ({ rule, ruleIndex, conditionIndex, declarativeRuleIndex, ...props }) => {
  const dispatch = useDeclarativeRuleDispatch();
  const onRuleDelete = () =>
    dispatch({ type: "deleteRule", payload: { declarativeRuleIndex, ruleIndex, conditionIndex } });

  return (
    <Box
      p={2}
      mb={1}
      border={1}
      display="flex"
      alignItems="flex-start"
      style={{ borderStyle: "dotted" }}
    >
      <Grid item container spacing={1} direction={"row"} alignItems={"center"} xs={12}>
        <MiddleText text={"The value of"} />
        <LHSComponent
          rule={rule}
          ruleIndex={ruleIndex}
          conditionIndex={conditionIndex}
          declarativeRuleIndex={declarativeRuleIndex}
        />
        {rule.isOperatorRequired() && (
          <OperatorComponent
            rule={rule}
            ruleIndex={ruleIndex}
            conditionIndex={conditionIndex}
            declarativeRuleIndex={declarativeRuleIndex}
          />
        )}
        {rule.isRhsRequired() && (
          <RHSComponent
            rule={rule}
            ruleIndex={ruleIndex}
            conditionIndex={conditionIndex}
            declarativeRuleIndex={declarativeRuleIndex}
          />
        )}
      </Grid>
      <Box>
        <Button size="small" onClick={onRuleDelete}>
          <DeleteIcon style={{ color: Colors.ValidationError }} />
        </Button>
      </Box>
    </Box>
  );
};

export default RuleComponent;
