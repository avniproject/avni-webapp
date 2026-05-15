import { Fragment, useEffect, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Grid,
  Box,
  Button,
  Stack,
} from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import PropTypes from "prop-types";
import {
  sampleChecklistRule,
  sampleDecisionRule,
  sampleEditFormRule,
  sampleShareRule,
  sampleTaskScheduleRule,
  sampleValidationRule,
  sampleVisitScheduleRule,
} from "../common/SampleRule";
import { ConceptSelect } from "common/components/ConceptSelect";
import RuleDesigner from "./DeclarativeRule/RuleDesigner";
import { confirmBeforeRuleEdit } from "../util";
import { get, isEqual } from "lodash";
import { JSEditor } from "../../common/components/JSEditor";
import KeyValues from "./KeyValues";
import FormShareTemplateService from "../../common/service/FormShareTemplateService";
import { httpClient as http } from "../../common/utils/httpClient";

const RulePanel = ({ title, details, nested = false }) => {
  const [expanded, setExpanded] = useState(false);
  const onToggleExpand = () => setExpanded(!expanded);

  return (
    <Accordion
      expanded={expanded}
      sx={nested ? { "&.Mui-expanded": { margin: 0 } } : undefined}
    >
      <AccordionSummary
        aria-controls="panel1a-content"
        id="panel1a-header"
        sx={{ marginTop: nested ? 0 : "3%" }}
      >
        <Grid
          container
          onClick={onToggleExpand}
          size={{
            sm: 12,
          }}
        >
          <span>{expanded ? <ExpandLess /> : <ExpandMore />}</span>
          <Typography>{title}</Typography>
        </Grid>
      </AccordionSummary>
      <AccordionDetails style={{ display: "block" }}>
        {details}
      </AccordionDetails>
    </Accordion>
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
  encounterTypes,
  onAiRuleCreation,
  onOpenAiRuleModal,
  ruleType,
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
            onAiRuleCreation={onAiRuleCreation}
            onJsCodeChange={onJsCodeChange}
            disableEditor={disabled}
            encounterTypes={encounterTypes}
            onOpenAiRuleModal={onOpenAiRuleModal}
            ruleType={ruleType}
          />
          <div>{children}</div>
        </Fragment>
      }
    />
  );
};

const FormLevelRules = ({
  form,
  disabled,
  onDeclarativeRuleUpdate,
  encounterTypes,
  onAiRuleCreation,
  ...props
}) => {
  const commonProps = {
    encounterTypes,
    subjectType: form.subjectType,
    form,
    disabled,
    onAiRuleCreation,
    onOpenAiRuleModal: props.onOpenAiRuleModal,
  };
  return (
    <div>
      <RulePanel
        title={"Edit Form Rule"}
        details={
          <Fragment>
            <JSEditor
              value={form.editFormRule || sampleEditFormRule()}
              onValueChange={(x) => props.onRuleUpdate("editFormRule", x)}
            />
          </Fragment>
        }
      />
      <DeclarativeFormRule
        title={"Decision Rule"}
        onValueChange={(jsonData) =>
          onDeclarativeRuleUpdate("decisionDeclarativeRule", jsonData)
        }
        rulesJson={form.decisionDeclarativeRule}
        updateJsCode={(declarativeRuleHolder) =>
          props.onRuleUpdate(
            "decisionRule",
            declarativeRuleHolder.generateDecisionRule(props.entityName),
          )
        }
        jsCode={form.decisionRule}
        error={get(form, "ruleError.decisionRule")}
        getApplicableActions={(state) =>
          state.getApplicableDecisionRuleActions()
        }
        sampleRule={sampleDecisionRule(props.entityName)}
        onJsCodeChange={(event) =>
          confirmBeforeRuleEdit(
            form.decisionDeclarativeRule,
            () => props.onRuleUpdate("decisionRule", event),
            () => onDeclarativeRuleUpdate("decisionDeclarativeRule", null),
          )
        }
        {...commonProps}
      >
        <Box
          sx={{
            mt: 5,
          }}
        >
          <Typography sx={{ mb: 1 }} variant="body1" component="div">
            Select decision concepts that you want as columns in the reporting
            views. You will have to refresh the{" "}
            <a
              href={"#/appdesigner/reportingViews"}
              target="_blank"
              rel="noopener noreferrer"
            >
              reporting views
            </a>{" "}
            for this to reflect.
          </Typography>
          <ConceptSelect
            concepts={form.decisionConcepts}
            setConcepts={(concepts) => {
              props.onDecisionConceptsUpdate(concepts);
            }}
          />
        </Box>
      </DeclarativeFormRule>
      <DeclarativeFormRule
        title={"Task Schedule Rule"}
        onValueChange={(jsonData) =>
          onDeclarativeRuleUpdate("taskScheduleDeclarativeRule", jsonData)
        }
        rulesJson={form.taskScheduleDeclarativeRule}
        updateJsCode={(declarativeRuleHolder) =>
          props.onRuleUpdate(
            "taskScheduleRule",
            declarativeRuleHolder.generateTaskScheduleRule(props.entityName),
          )
        }
        jsCode={form.taskScheduleRule}
        error={get(form, "ruleError.taskScheduleRule")}
        getApplicableActions={(state) =>
          state.getApplicableTaskScheduleRuleActions()
        }
        sampleRule={sampleTaskScheduleRule(props.entityName)}
        onJsCodeChange={(event) =>
          confirmBeforeRuleEdit(
            form.taskScheduleDeclarativeRule,
            () => props.onRuleUpdate("taskScheduleRule", event),
            () => onDeclarativeRuleUpdate("taskScheduleDeclarativeRule", null),
          )
        }
        {...commonProps}
      />
      <DeclarativeFormRule
        title={"Visit Schedule Rule"}
        onValueChange={(jsonData) =>
          onDeclarativeRuleUpdate("visitScheduleDeclarativeRule", jsonData)
        }
        rulesJson={form.visitScheduleDeclarativeRule}
        updateJsCode={(declarativeRuleHolder) =>
          props.onRuleUpdate(
            "visitScheduleRule",
            declarativeRuleHolder.generateVisitScheduleRule(props.entityName),
          )
        }
        jsCode={form.visitScheduleRule}
        error={get(form, "ruleError.visitScheduleRule")}
        getApplicableActions={(state) =>
          state.getApplicableVisitScheduleRuleActions()
        }
        sampleRule={sampleVisitScheduleRule(props.entityName)}
        onJsCodeChange={(event) =>
          confirmBeforeRuleEdit(
            form.visitScheduleDeclarativeRule,
            () => props.onRuleUpdate("visitScheduleRule", event),
            () => onDeclarativeRuleUpdate("visitScheduleDeclarativeRule", null),
          )
        }
        ruleType="visitSchedule"
        {...commonProps}
      />
      <DeclarativeFormRule
        title={"Validation Rule"}
        onValueChange={(jsonData) =>
          onDeclarativeRuleUpdate("validationDeclarativeRule", jsonData)
        }
        rulesJson={form.validationDeclarativeRule}
        updateJsCode={(declarativeRuleHolder) =>
          props.onRuleUpdate(
            "validationRule",
            declarativeRuleHolder.generateFormValidationRule(props.entityName),
          )
        }
        jsCode={form.validationRule}
        error={get(form, "ruleError.validationRule")}
        getApplicableActions={(state) =>
          state.getApplicableFormValidationRuleActions()
        }
        sampleRule={sampleValidationRule(props.entityName)}
        onJsCodeChange={(event) =>
          confirmBeforeRuleEdit(
            form.validationDeclarativeRule,
            () => props.onRuleUpdate("validationRule", event),
            () => onDeclarativeRuleUpdate("validationDeclarativeRule", null),
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
              onValueChange={(event) =>
                props.onRuleUpdate("checklistsRule", event)
              }
              disabled={disabled}
            />
          }
        />
      )}
      <RulePanel
        title={"Share Rule Config"}
        details={
          <Fragment>
            <RulePanel
              nested
              title={"Share Rule"}
              details={
                <Fragment>
                  <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                    Returns {"{data?, text?}"}. `data` is injected into the
                    Share HTML Template (PDF format). `text` is used as-is for
                    WhatsApp / text share. Both fields are optional. Register
                    translation keys in the Share Translations sub-panel.
                  </Typography>
                  <JSEditor
                    value={form.shareRule || sampleShareRule()}
                    onValueChange={(x) => props.onRuleUpdate("shareRule", x)}
                    disabled={disabled}
                  />
                </Fragment>
              }
            />
            <RulePanel
              nested
              title={"Share HTML Template"}
              details={
                <ShareHtmlTemplateUploader
                  form={form}
                  onChange={(s3Key) =>
                    props.onRuleUpdate("shareTemplateS3Key", s3Key)
                  }
                  disabled={disabled}
                />
              }
            />
            <RulePanel
              nested
              title={"Share Translations"}
              details={
                <Fragment>
                  <Typography variant="caption" component="div" sx={{ mb: 1 }}>
                    Keys here are exported with the languages bundle.
                    Per-language values are filled in via the Translations menu;
                    this table holds English defaults only.
                  </Typography>
                  <ShareTranslationsEditor
                    value={form.shareTranslations}
                    onChange={(next) =>
                      props.onRuleUpdate("shareTranslations", next)
                    }
                  />
                </Fragment>
              }
            />
          </Fragment>
        }
      />
    </div>
  );
};

const ShareHtmlTemplateUploader = ({ form, onChange, disabled }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const s3Key = form.shareTemplateS3Key;
  const hasTemplate = !!s3Key;
  const onFile = async (file) => {
    if (!file) return;
    if (!form.uuid) {
      setError("Save the form once before uploading a share template.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const res = await FormShareTemplateService.upload(form.uuid, file);
      onChange(res?.data || null);
    } catch (e) {
      setError(e?.response?.data || e?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };
  const onDownload = () => {
    if (!s3Key) return;
    http.downloadFile(FormShareTemplateService.fileUrl(s3Key), s3Key);
  };
  return (
    <Fragment>
      <Typography variant="caption" component="div" sx={{ mb: 1 }}>
        HTML used to render Share as PDF. Use {"{{key}}"} placeholders that
        resolve from the `data` object returned by the Share Rule.
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          size="small"
          variant="outlined"
          component="label"
          disabled={disabled || uploading}
        >
          {uploading
            ? "Uploading..."
            : hasTemplate
              ? "Replace HTML"
              : "Upload HTML"}
          <input
            type="file"
            accept=".html,text/html"
            hidden
            onChange={(e) => onFile(e.target.files[0])}
          />
        </Button>
        {hasTemplate && (
          <Button size="small" variant="text" onClick={onDownload}>
            Download current
          </Button>
        )}
        {hasTemplate && (
          <Button
            size="small"
            color="error"
            variant="text"
            onClick={() => onChange(null)}
            disabled={disabled}
          >
            Clear
          </Button>
        )}
        <Typography variant="caption" color="text.secondary">
          {hasTemplate ? s3Key : "No template uploaded"}
        </Typography>
      </Stack>
      {error && (
        <Typography
          variant="caption"
          color="error"
          sx={{ mt: 1 }}
          component="div"
        >
          {String(error)}
        </Typography>
      )}
    </Fragment>
  );
};

const shareTranslationsToRows = (translations) =>
  Object.entries(translations || {}).map(([key, value]) => ({ key, value }));

const rowsToShareTranslations = (rows) =>
  rows.reduce((acc, row) => {
    if (row && row.key) acc[row.key] = row.value || "";
    return acc;
  }, {});

const ShareTranslationsEditor = ({ value, onChange }) => {
  const [rows, setRows] = useState(() => shareTranslationsToRows(value));

  useEffect(() => {
    if (!isEqual(rowsToShareTranslations(rows), value || {})) {
      const hasDraftRow = rows.some((r) => !r || !r.key);
      if (!hasDraftRow) setRows(shareTranslationsToRows(value));
    }
  }, [value]);

  const commit = (nextRows) => {
    setRows(nextRows);
    onChange(rowsToShareTranslations(nextRows));
  };

  return (
    <KeyValues
      keyValues={rows}
      keyLabel="Translation Key"
      valueLabel="Default (English) Value"
      addButtonLabel="Add Translation"
      tooltipKey="APP_DESIGNER_CARD_TRANSLATIONS"
      multilineValue
      onKeyValueChange={(next, index) => {
        const nextRows = [...rows];
        nextRows[index] = {
          key: (next.key || "").trim(),
          value: next.value,
        };
        commit(nextRows);
      }}
      onAddNewKeyValue={() => commit([...rows, { key: "", value: "" }])}
      onDeleteKeyValue={(index) => {
        const nextRows = [...rows];
        nextRows.splice(index, 1);
        commit(nextRows);
      }}
    />
  );
};

FormLevelRules.propTypes = {
  form: PropTypes.object.isRequired,
  onRuleUpdate: PropTypes.func.isRequired,
  onToggleExpandPanel: PropTypes.func.isRequired,
};

export default FormLevelRules;
