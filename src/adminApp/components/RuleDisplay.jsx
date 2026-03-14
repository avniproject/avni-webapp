import { FormLabel } from "@mui/material";
import PropTypes from "prop-types";
import { JSEditor } from "../../common/components/JSEditor";

const RuleDisplay = (props) => {
  const { fieldLabel, ruleText = "" } = props;

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <FormLabel style={{ fontSize: "13px" }}>{fieldLabel}</FormLabel>
      <br />
      <div style={{ maxWidth: "100%" }}>
        <JSEditor readOnly value={ruleText} />
      </div>
    </div>
  );
};

RuleDisplay.propTypes = {
  fieldLabel: PropTypes.string.isRequired,
  ruleText: PropTypes.string,
  toolTipKey: PropTypes.string,
};

export default RuleDisplay;
