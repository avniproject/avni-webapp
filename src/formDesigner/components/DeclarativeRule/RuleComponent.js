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

const RuleComponent = ({ rule, ruleIndex, conditionIndex, ...props }) => {
  const dispatch = useDeclarativeRuleDispatch();
  const onRuleDelete = () =>
    dispatch({ type: "deleteRule", payload: { ruleIndex, conditionIndex } });

  return (
    <Box component={"div"} p={2} mb={1} border={1}>
      {ruleIndex !== 0 && (
        <Grid item container justify={"flex-end"}>
          <Button size="small" onClick={onRuleDelete}>
            <DeleteIcon style={{ color: Colors.ValidationError }} />
          </Button>
        </Grid>
      )}
      <Grid item container spacing={1} direction={"row"} alignItems={"center"}>
        <Grid item>
          <div>{"The value of"}</div>
        </Grid>
        <LHSComponent rule={rule} ruleIndex={ruleIndex} conditionIndex={conditionIndex} />
        <OperatorComponent rule={rule} ruleIndex={ruleIndex} conditionIndex={conditionIndex} />
        {rule.isRhsRequired() ? (
          <RHSComponent rule={rule} ruleIndex={ruleIndex} conditionIndex={conditionIndex} />
        ) : null}
      </Grid>
    </Box>
  );
};

export default RuleComponent;
