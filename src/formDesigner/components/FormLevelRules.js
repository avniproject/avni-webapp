import React, { useState } from "react";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs/components/prism-core";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import PropTypes from "prop-types";
import {
  sampleChecklistRule,
  sampleDecisionRule,
  sampleValidationRule,
  sampleVisitScheduleRule
} from "../common/SampleRule";

const FormRule = ({ title, value, onValueChange }) => {
  const [expanded, setExpanded] = useState(false);
  const onToggleExpand = () => setExpanded(!expanded);

  return (
    <ExpansionPanel expanded={expanded}>
      <ExpansionPanelSummary
        aria-controls="panel1a-content"
        id="panel1a-header"
        style={{ marginTop: "3%" }}
      >
        <Grid container item sm={12} onClick={onToggleExpand}>
          <span>{expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}</span>
          <Typography>{title}</Typography>
        </Grid>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <Editor
          value={value}
          onValueChange={onValueChange}
          highlight={code => highlight(code, languages.js)}
          padding={10}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 15,
            width: "100%",
            height: "auto",
            borderStyle: "solid",
            borderWidth: "1px"
          }}
        />
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

const FormLevelRules = props => {
  return (
    <div>
      <FormRule
        title={"Decision Rule"}
        value={props.form.decisionRule || sampleDecisionRule(props.entityName)}
        onValueChange={event => props.onRuleUpdate("decisionRule", event)}
      />
      <FormRule
        title={"Visit Schedule Rule"}
        value={props.form.visitScheduleRule || sampleVisitScheduleRule(props.entityName)}
        onValueChange={event => props.onRuleUpdate("visitScheduleRule", event)}
      />
      <FormRule
        title={"Validation Rule"}
        value={props.form.validationRule || sampleValidationRule(props.entityName)}
        onValueChange={event => props.onRuleUpdate("validationRule", event)}
      />
      {props.form.formType === "ProgramEnrolment" && (
        <FormRule
          title={"Checklist Rule"}
          value={props.form.checklistsRule || sampleChecklistRule()}
          onValueChange={event => props.onRuleUpdate("checklistsRule", event)}
        />
      )}
    </div>
  );
};

FormLevelRules.propTypes = {
  form: PropTypes.object.isRequired,
  onRuleUpdate: PropTypes.func.isRequired,
  onToggleExpandPanel: PropTypes.func.isRequired
};

export default FormLevelRules;
