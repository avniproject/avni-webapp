import React from "react";
import RuleComponent from "./RuleComponent";
import { isEmpty, map, toUpper } from "lodash";
import { Box, Grid } from "@material-ui/core";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import IconButton from "../IconButton";
import CompoundRuleConjunctionComponent from "./CompoundRuleConjunctionComponent";
import { useDeclarativeRuleDispatch } from "./DeclarativeRuleContext";
import DeleteIcon from "@material-ui/icons/Delete";
import Colors from "../../../dataEntryApp/Colors";
import Button from "@material-ui/core/Button";
import Chip from "@material-ui/core/Chip";

const CompoundRuleComponent = ({
  compoundRule,
  conditionIndex,
  declarativeRuleIndex,
  ...props
}) => {
  const dispatch = useDeclarativeRuleDispatch();
  const { conjunction, rules } = compoundRule;

  const onCompoundRuleConjunctionChange = event => {
    const conjunction = event.target.value;
    dispatch({
      type: "compoundRuleConjunctionChange",
      payload: { declarativeRuleIndex, conjunction, conditionIndex }
    });
  };

  const onConditionDelete = () =>
    dispatch({ type: "deleteCondition", payload: { declarativeRuleIndex, conditionIndex } });

  return (
    <Box m={1} border={1} p={2}>
      <Box display="flex" alignItems="flex-start" justifyContent={"space-between"}>
        <CompoundRuleConjunctionComponent
          onConjunctionChange={onCompoundRuleConjunctionChange}
          value={conjunction}
        />
        <Box>
          <Button size="small" onClick={onConditionDelete}>
            <DeleteIcon style={{ color: Colors.ValidationError }} />
          </Button>
        </Box>
      </Box>
      <Grid container direction={"column"}>
        {map(rules, (rule, index) => (
          <Grid item container direction={"column"} spacing={1} key={index}>
            {index !== 0 && (
              <Grid item container justify={"center"}>
                <Chip
                  style={{ marginTop: "10px", marginBottom: "10px" }}
                  color="primary"
                  label={toUpper(compoundRule.conjunction)}
                />
              </Grid>
            )}
            <RuleComponent
              rule={rule}
              ruleIndex={index}
              conditionIndex={conditionIndex}
              declarativeRuleIndex={declarativeRuleIndex}
            />
          </Grid>
        ))}
      </Grid>
      <IconButton
        Icon={AddCircleIcon}
        label={"Add new rule"}
        onClick={() =>
          dispatch({ type: "addNewRule", payload: { declarativeRuleIndex, conditionIndex } })
        }
        disabled={isEmpty(conjunction)}
      />
    </Box>
  );
};

export default CompoundRuleComponent;
