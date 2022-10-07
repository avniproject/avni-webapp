import React, { Fragment, useState } from "react";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import PropTypes from "prop-types";
import {
  sampleChecklistRule,
  sampleDecisionRule,
  sampleTaskScheduleRule,
  sampleValidationRule,
  sampleVisitScheduleRule
} from "../common/SampleRule";
import { ConceptSelect } from "common/components/ConceptSelect";
import Box from "@material-ui/core/Box";
import RuleDesigner from "./DeclarativeRule/RuleDesigner";
import { confirmBeforeRuleEdit } from "../util";
import { get } from "lodash";
import { JSEditor } from "../../common/components/JSEditor";

const RulePanel = ({ title, details }) => {
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
      <ExpansionPanelDetails style={{ display: "block" }}>{details}</ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

const DeclarativeFormRule = ({
  title,
  onValueChange,
  disabled,
  children,
  rulesJson,
  updateJsCode,
  jsCode,
  error,
  subjectType,
  form,
  getApplicableActions,
  sampleRule,
  onJsCodeChange,
  encounterTypes
}) => {
  return (
    <RulePanel
      title={title}
      details={
        <Fragment>
          <RuleDesigner
            rulesJson={rulesJson}
            onValueChange={onValueChange}
            updateJsCode={updateJsCode}
            jsCode={jsCode}
            error={error}
            subjectType={subjectType}
            form={form}
            getApplicableActions={getApplicableActions}
            sampleRule={sampleRule}
            onJsCodeChange={onJsCodeChange}
            disableEditor={disabled}
            encounterTypes={encounterTypes}
          />
          <div>{children}</div>
        </Fragment>
      }
    />
  );
};

const FormLevelRules = ({ form, disabled, onDeclarativeRuleUpdate, encounterTypes, ...props }) => {
  const commonProps = {
    encounterTypes,
    subjectType: form.subjectType,
    form,
    disabled
  };
  return (
    <div>
      <DeclarativeFormRule
        title={"Decision Rule"}
        onValueChange={jsonData => onDeclarativeRuleUpdate("decisionDeclarativeRule", jsonData)}
        rulesJson={form.decisionDeclarativeRule}
        updateJsCode={declarativeRuleHolder =>
          props.onRuleUpdate(
            "decisionRule",
            declarativeRuleHolder.generateDecisionRule(props.entityName)
          )
        }
        jsCode={form.decisionRule}
        error={get(form, "ruleError.decisionRule")}
        getApplicableActions={state => state.getApplicableDecisionRuleActions()}
        sampleRule={sampleDecisionRule(props.entityName)}
        onJsCodeChange={event =>
          confirmBeforeRuleEdit(
            form.decisionDeclarativeRule,
            () => props.onRuleUpdate("decisionRule", event),
            () => onDeclarativeRuleUpdate("decisionDeclarativeRule", null)
          )
        }
        {...commonProps}
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
            concepts={form.decisionConcepts}
            setConcepts={concepts => {
              props.onDecisionConceptsUpdate(concepts);
            }}
          />
        </Box>
      </DeclarativeFormRule>
      <DeclarativeFormRule
        title={"Task Schedule Rule"}
        onValueChange={jsonData => onDeclarativeRuleUpdate("taskScheduleDeclarativeRule", jsonData)}
        rulesJson={form.taskScheduleDeclarativeRule}
        updateJsCode={declarativeRuleHolder =>
          props.onRuleUpdate(
            "taskScheduleRule",
            declarativeRuleHolder.generateTaskScheduleRule(props.entityName)
          )
        }
        jsCode={form.taskScheduleRule}
        error={get(form, "ruleError.taskScheduleRule")}
        getApplicableActions={state => state.getApplicableTaskScheduleRuleActions()}
        sampleRule={sampleTaskScheduleRule(props.entityName)}
        onJsCodeChange={event =>
          confirmBeforeRuleEdit(
            form.taskScheduleDeclarativeRule,
            () => props.onRuleUpdate("taskScheduleRule", event),
            () => onDeclarativeRuleUpdate("taskScheduleDeclarativeRule", null)
          )
        }
        {...commonProps}
      />
      <DeclarativeFormRule
        title={"Visit Schedule Rule"}
        onValueChange={jsonData =>
          onDeclarativeRuleUpdate("visitScheduleDeclarativeRule", jsonData)
        }
        rulesJson={form.visitScheduleDeclarativeRule}
        updateJsCode={declarativeRuleHolder =>
          props.onRuleUpdate(
            "visitScheduleRule",
            declarativeRuleHolder.generateVisitScheduleRule(props.entityName)
          )
        }
        jsCode={form.visitScheduleRule}
        error={get(form, "ruleError.visitScheduleRule")}
        getApplicableActions={state => state.getApplicableVisitScheduleRuleActions()}
        sampleRule={sampleVisitScheduleRule(props.entityName)}
        onJsCodeChange={event =>
          confirmBeforeRuleEdit(
            form.visitScheduleDeclarativeRule,
            () => props.onRuleUpdate("visitScheduleRule", event),
            () => onDeclarativeRuleUpdate("visitScheduleDeclarativeRule", null)
          )
        }
        {...commonProps}
      />
      <DeclarativeFormRule
        title={"Validation Rule"}
        onValueChange={jsonData => onDeclarativeRuleUpdate("validationDeclarativeRule", jsonData)}
        rulesJson={form.validationDeclarativeRule}
        updateJsCode={declarativeRuleHolder =>
          props.onRuleUpdate(
            "validationRule",
            declarativeRuleHolder.generateFormValidationRule(props.entityName)
          )
        }
        jsCode={form.validationRule}
        error={get(form, "ruleError.validationRule")}
        getApplicableActions={state => state.getApplicableFormValidationRuleActions()}
        sampleRule={sampleValidationRule(props.entityName)}
        onJsCodeChange={event =>
          confirmBeforeRuleEdit(
            form.validationDeclarativeRule,
            () => props.onRuleUpdate("validationRule", event),
            () => onDeclarativeRuleUpdate("validationDeclarativeRule", null)
          )
        }
        {...commonProps}
      />
      {form.formType === "ProgramEnrolment" && (
        <RulePanel
          title={"Checklist Rule"}
          details={
            <JSEditor
              value={form.checklistsRule || sampleChecklistRule()}
              onValueChange={event => props.onRuleUpdate("checklistsRule", event)}
              disabled={disabled}
            />
          }
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
