import React from "react";
import LHSComponent from "./LHSComponent";
import RHSComponent from "./RHSComponent";
import OperatorComponent from "./OperatorComponent";
import { Grid, Box, Button } from "@mui/material";
import { Delete } from "@mui/icons-material";
import Colors from "../../../dataEntryApp/Colors";
import { useDeclarativeRuleDispatch } from "./DeclarativeRuleContext";
import MiddleText from "./MiddleText";

const RuleComponent = ({ rule, ruleIndex, conditionIndex, declarativeRuleIndex, ...props }) => {
  const dispatch = useDeclarativeRuleDispatch();
  const onRuleDelete = () => dispatch({ type: "deleteRule", payload: { declarativeRuleIndex, ruleIndex, conditionIndex } });

  return (
    <Box
      style={{ borderStyle: "dotted" }}
      sx={{
        p: 2,
        mb: 1,
        border: 1,
        display: "flex",
        alignItems: "flex-start"
      }}
    >
      <Grid
        item
        container
        spacing={1}
        direction={"row"}
        xs={12}
        sx={{
          alignItems: "center"
        }}
      >
        <MiddleText text={"The value of"} />
        <LHSComponent rule={rule} ruleIndex={ruleIndex} conditionIndex={conditionIndex} declarativeRuleIndex={declarativeRuleIndex} />
        {rule.isOperatorRequired() && (
          <OperatorComponent
            rule={rule}
            ruleIndex={ruleIndex}
            conditionIndex={conditionIndex}
            declarativeRuleIndex={declarativeRuleIndex}
          />
        )}
        {rule.isRhsRequired() && (
          <RHSComponent rule={rule} ruleIndex={ruleIndex} conditionIndex={conditionIndex} declarativeRuleIndex={declarativeRuleIndex} />
        )}
      </Grid>
      <Box>
        <Button size="small" onClick={onRuleDelete}>
          <Delete style={{ color: Colors.ValidationError }} />
        </Button>
      </Box>
    </Box>
  );
};
export default RuleComponent;
