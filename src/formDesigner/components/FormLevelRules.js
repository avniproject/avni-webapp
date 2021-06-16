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
import { ConceptSelect } from "common/components/ConceptSelect";
import Box from "@material-ui/core/Box";

const FormRule = ({ title, value, onValueChange, disabled, children }) => {
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
      <ExpansionPanelDetails style={{ display: "block" }}>
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
          disabled={disabled}
        />
        <div>{children}</div>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

const FormLevelRules = ({ disabled, ...props }) => {
  return (
    <div>
      <FormRule
        title={"Decision Rule"}
        value={props.form.decisionRule || sampleDecisionRule(props.entityName)}
        onValueChange={event => props.onRuleUpdate("decisionRule", event)}
        disabled={disabled}
      >
        <Box mt={5}>
          <Typography gutterBottom variant="body1" component="div">
            Select decision concepts that you want as columns in the reporting views. You will have
            to refresh the{" "}
            <a href={"#/appdesigner/reportingViews"} target="_blank" rel="noopener noreferrer">
              reporting views
            </a>{" "}
            for this to reflect.
          </Typography>
          <ConceptSelect
            concepts={props.form.decisionConcepts}
            setConcepts={concepts => {
              console.log("setConcepts => ", concepts);
              props.onDecisionConceptsUpdate(concepts);
            }}
          />
        </Box>
      </FormRule>
      <FormRule
        title={"Visit Schedule Rule"}
        value={props.form.visitScheduleRule || sampleVisitScheduleRule(props.entityName)}
        onValueChange={event => props.onRuleUpdate("visitScheduleRule", event)}
        disabled={disabled}
      />
      <FormRule
        title={"Validation Rule"}
        value={props.form.validationRule || sampleValidationRule(props.entityName)}
        onValueChange={event => props.onRuleUpdate("validationRule", event)}
        disabled={disabled}
      />
      {props.form.formType === "ProgramEnrolment" && (
        <FormRule
          title={"Checklist Rule"}
          value={props.form.checklistsRule || sampleChecklistRule()}
          onValueChange={event => props.onRuleUpdate("checklistsRule", event)}
          disabled={disabled}
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
