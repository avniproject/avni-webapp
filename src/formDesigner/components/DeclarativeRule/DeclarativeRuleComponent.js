import React from "react";
import { map, find, isEmpty, size } from "lodash";
import ActionComponent from "./ActionComponent";
import ConditionComponent from "./ConditionComponent";
import { AddCircle, Delete } from "@mui/icons-material";
import IconButton from "../IconButton";
import { Box, Grid, Typography, Button } from "@mui/material";
import Colors from "../../../dataEntryApp/Colors";
import { useDeclarativeRuleDispatch } from "./DeclarativeRuleContext";

const DeclarativeRuleComponent = ({ declarativeRule, declarativeRuleIndex, getApplicableActions, ...props }) => {
  const dispatch = useDeclarativeRuleDispatch();

  return (
    <Box component={"div"} border={1} p={1} mb={1}>
      <Grid container item justifyContent={"flex-end"}>
        <Button
          size="small"
          onClick={() => dispatch({ type: "deleteDeclarativeRule", payload: { declarativeRuleIndex } })}
          disabled={size(declarativeRule.conditions) > 1}
        >
          <Delete style={{ color: Colors.ValidationError }} />
        </Button>
      </Grid>
      {map(declarativeRule.conditions, (condition, index) => (
        <ConditionComponent key={index} condition={condition} index={index} declarativeRuleIndex={declarativeRuleIndex} />
      ))}
      <IconButton
        Icon={AddCircle}
        label={"Add new condition"}
        onClick={() => dispatch({ type: "newCondition", payload: { declarativeRuleIndex } })}
        disabled={!!find(declarativeRule.conditions, condition => isEmpty(condition.conjunction))}
        size="large"
      />
      <Typography gutterBottom variant={"subtitle1"}>
        {"Actions"}
      </Typography>
      {map(declarativeRule.actions, (action, index) => (
        <ActionComponent
          key={index}
          action={action}
          index={index}
          declarativeRuleIndex={declarativeRuleIndex}
          getApplicableActions={getApplicableActions}
        />
      ))}
    </Box>
  );
};

export default DeclarativeRuleComponent;
