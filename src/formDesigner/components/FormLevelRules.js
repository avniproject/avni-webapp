import React from "react";
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

function FormLevelRules(props) {
  return (
    <div>
      <ExpansionPanel expanded={props.form.decisionExpand}>
        <ExpansionPanelSummary
          aria-controls="panel1a-content"
          id="panel1a-header"
          style={{ marginTop: "3%" }}
        >
          <Grid container item sm={12}>
            <span onClick={event => props.onToggleExpandPanel("decisionExpand")}>
              {props.form.decisionExpand ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </span>

            <Typography>Decision Rule</Typography>
          </Grid>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Editor
            value={props.form.decisionRule}
            onValueChange={event => props.onRuleUpdate("decisionRule", event)}
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

      <ExpansionPanel expanded={props.form.visitScheduleExpand}>
        <ExpansionPanelSummary
          aria-controls="panel2a-content"
          id="panel2a-header"
          style={{ marginTop: "3%" }}
        >
          <Grid container item sm={12}>
            <span onClick={event => props.onToggleExpandPanel("visitScheduleExpand")}>
              {props.form.visitScheduleExpand ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </span>

            <Typography>Visit Schedule Rule</Typography>
          </Grid>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Editor
            value={props.form.visitScheduleRule}
            onValueChange={event => props.onRuleUpdate("visitScheduleRule", event)}
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
      <ExpansionPanel expanded={props.form.validationExpand}>
        <ExpansionPanelSummary
          aria-controls="panel3a-content"
          id="panel3a-header"
          style={{ marginTop: "3%" }}
        >
          <Grid container item sm={12}>
            <span onClick={event => props.onToggleExpandPanel("validationExpand")}>
              {props.form.validationExpand ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </span>

            <Typography>Validation Rule</Typography>
          </Grid>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Editor
            value={props.form.validationRule}
            onValueChange={event => props.onRuleUpdate("validationRule", event)}
            highlight={code => highlight(code, languages.js)}
            padding={10}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 15,
              height: "auto",
              width: "100%",
              borderStyle: "solid",
              borderWidth: "1px"
            }}
          />
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </div>
  );
}

FormLevelRules.propTypes = {
  form: PropTypes.object.isRequired,
  onRuleUpdate: PropTypes.func.isRequired,
  onToggleExpandPanel: PropTypes.func.isRequired
};

export default FormLevelRules;
