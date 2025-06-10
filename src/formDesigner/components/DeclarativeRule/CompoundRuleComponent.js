import React from "react";
import RuleComponent from "./RuleComponent";
import { isEmpty, map, toUpper } from "lodash";
import { Box, Grid, Button, Chip } from "@mui/material";
import { AddCircle, Delete } from "@mui/icons-material";
import IconButton from "../IconButton";
import CompoundRuleConjunctionComponent from "./CompoundRuleConjunctionComponent";
import { useDeclarativeRuleDispatch } from "./DeclarativeRuleContext";
import Colors from "../../../dataEntryApp/Colors";

const CompoundRuleComponent = ({ compoundRule, conditionIndex, declarativeRuleIndex, ...props }) => {
  const dispatch = useDeclarativeRuleDispatch();
  const { conjunction, rules } = compoundRule;

  const onCompoundRuleConjunctionChange = event => {
    const conjunction = event.target.value;
    dispatch({
      type: "compoundRuleConjunctionChange",
      payload: { declarativeRuleIndex, conjunction, conditionIndex }
    });
  };

  const onConditionDelete = () => dispatch({ type: "deleteCondition", payload: { declarativeRuleIndex, conditionIndex } });

  return (
    <Box m={1} border={1} p={2}>
      <Box display="flex" alignItems="flex-start" justifyContent={"space-between"}>
        <CompoundRuleConjunctionComponent onConjunctionChange={onCompoundRuleConjunctionChange} value={conjunction} />
        <Box>
          <Button size="small" onClick={onConditionDelete}>
            <Delete style={{ color: Colors.ValidationError }} />
          </Button>
        </Box>
      </Box>
      <Grid container direction={"column"}>
        {map(rules, (rule, index) => (
          <Grid item container direction={"column"} spacing={1} key={index}>
            {index !== 0 && (
              <Grid item container justifyContent={"center"}>
                <Chip style={{ marginTop: "10px", marginBottom: "10px" }} color="primary" label={toUpper(compoundRule.conjunction)} />
              </Grid>
            )}
            <RuleComponent rule={rule} ruleIndex={index} conditionIndex={conditionIndex} declarativeRuleIndex={declarativeRuleIndex} />
          </Grid>
        ))}
      </Grid>
      <IconButton
        Icon={AddCircle}
        label={"Add new rule"}
        onClick={() => dispatch({ type: "addNewRule", payload: { declarativeRuleIndex, conditionIndex } })}
        disabled={isEmpty(conjunction)}
        size="large"
      />
    </Box>
  );
};

export default CompoundRuleComponent;
