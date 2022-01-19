import RadioGroup from "@material-ui/core/RadioGroup";
import { CompoundRule } from "rules-config";
import React from "react";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";

const CompoundRuleConjunctionComponent = ({ onConjunctionChange, value, ...props }) => {
  const Conjunction = ({ value, label, onChange }) => {
    return (
      <FormControlLabel
        control={<Radio color="primary" />}
        value={value}
        label={label}
        onChange={onChange}
      />
    );
  };

  return (
    <RadioGroup row aria-label="position" name="position">
      <RadioGroup row aria-label="conjunction" defaultValue={value}>
        <Conjunction
          label={"Match all of the below"}
          value={CompoundRule.conjunctions.And}
          onChange={onConjunctionChange}
        />
        <Conjunction
          label={"Match any of the below"}
          value={CompoundRule.conjunctions.Or}
          onChange={onConjunctionChange}
        />
      </RadioGroup>
    </RadioGroup>
  );
};

export default CompoundRuleConjunctionComponent;
