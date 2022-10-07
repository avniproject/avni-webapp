import React from "react";
import FormLabel from "@material-ui/core/FormLabel";
import PropTypes from "prop-types";
import { JSEditor } from "../../common/components/JSEditor";

const RuleDisplay = props => {
  const { fieldLabel, ruleText = "" } = props;

  return (
    <div>
      <FormLabel style={{ fontSize: "13px" }}>{fieldLabel}</FormLabel>
      <br />
      <JSEditor readOnly value={ruleText} />
    </div>
  );
};

RuleDisplay.propTypes = {
  fieldLabel: PropTypes.string.isRequired,
  ruleText: PropTypes.string,
  toolTipKey: PropTypes.string
};

export default RuleDisplay;
