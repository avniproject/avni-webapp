import React from "react";
import { map, find, isEmpty } from "lodash";
import ActionComponent from "./ActionComponent";
import ConditionComponent from "./ConditionComponent";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import IconButton from "../IconButton";
import { Box, Grid, Typography } from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import Colors from "../../../dataEntryApp/Colors";
import Button from "@material-ui/core/Button";
import { useDeclarativeRuleDispatch } from "./DeclarativeRuleContext";

const DeclarativeRuleComponent = ({
  declarativeRule,
  onStateChange,
  onDelete,
  declarativeRuleIndex,
  getApplicableActions,
  ...props
}) => {
  const dispatch = useDeclarativeRuleDispatch();

  return (
    <Box component={"div"} border={1} p={1} mb={1}>
      {declarativeRuleIndex !== 0 && (
        <Grid container item justify={"flex-end"}>
          <Button
            size="small"
            onClick={() =>
              dispatch({ type: "deleteDeclarativeRule", payload: { declarativeRuleIndex } })
            }
          >
            <DeleteIcon style={{ color: Colors.ValidationError }} />
          </Button>
        </Grid>
      )}
      {map(declarativeRule.conditions, (condition, index) => (
        <ConditionComponent
          key={index}
          condition={condition}
          index={index}
          declarativeRuleIndex={declarativeRuleIndex}
        />
      ))}
      <IconButton
        Icon={AddCircleIcon}
        label={"Add new condition"}
        onClick={() => dispatch({ type: "newCondition", payload: { declarativeRuleIndex } })}
        disabled={!!find(declarativeRule.conditions, condition => isEmpty(condition.conjunction))}
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
