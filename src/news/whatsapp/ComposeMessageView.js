import React, { useEffect, useReducer } from "react";
import { getMessageTemplates, sendManualMessage } from "../../adminApp/service/MessageService";
import { MessageReducer } from "../../formDesigner/components/MessageRule/MessageReducer";
import _ from "lodash";
import { AvniFormLabel } from "../../common/components/AvniFormLabel";
import Select from "react-select";
import { KeyboardDateTimePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { AvniTextField } from "../../common/components/AvniTextField";
import { Box, Button, Dialog, DialogActions, DialogTitle } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import { Close } from "@material-ui/icons";

const ComposeMessageView = ({ receiverIds, receiverType, onClose, onSchedulingAttempted }) => {
  const [{ rules, templates }, rulesDispatch] = useReducer(MessageReducer, {
    rules: [{ scheduledDateTime: new Date() }],
    templates: []
  });

  useEffect(() => {
    getMessageTemplates(rulesDispatch);
  }, []);

  const getNumberOfParametersForTemplate = messageTemplateId => {
    const template = getSelectedTemplate(messageTemplateId);
    const parameterArray = template.body.match(/{{[0-9]+}}/g);
    return parameterArray ? parameterArray.length : 0;
  };
  const onRuleChange = updatedValues => {
    if (_.has(updatedValues, "messageTemplateId")) {
      const noOfParameters = getNumberOfParametersForTemplate(updatedValues.messageTemplateId);
      const parameters = Array.apply(null, Array(noOfParameters)).map(function() {
        return "";
      });
      updatedValues = { ...updatedValues, parameters };
    }

    rules[0] = { ...rules[0], ...updatedValues };
    rulesDispatch({ type: "setRules", payload: rules });
  };

  const onVariableChange = (index, updatedValue) => {
    rules[0].parameters[index] = updatedValue;
    rulesDispatch({ type: "setRules", payload: rules });
  };

  const getSelectedTemplate = selectedTemplateId => {
    return _.find(templates, template => template.id === selectedTemplateId);
  };

  const dateTimeFormat = "dd/MM/yyyy HH:mm";

  const onSubmit = async event => {
    event.preventDefault();
    try {
      await sendManualMessage(receiverId, receiverType, rules[0]);
      onSchedulingAttempted("success");
    } catch (error) {
      console.log("Message scheduling failed:", error);
      onSchedulingAttempted("error");
    }
  };

  const allFilled = () => {
    return (
      rules[0].messageTemplateId &&
      rules[0].scheduledDateTime &&
      _.reduce(
        rules[0].parameters,
        (allFilled, parameter) => {
          return allFilled && !_.isNil(parameter) && !_.isEmpty(parameter);
        },
        true
      )
    );
  };

  return (
    <Dialog
      onClose={() => {}}
      aria-labelledby="customized-dialog-title"
      open={true}
      fullWidth={true}
      maxWidth="lg"
    >
      <DialogTitle
        id="customized-dialog-title"
        onClose={onClose}
        style={{ backgroundColor: "#2196f3", color: "white" }}
      >
        Send Message
      </DialogTitle>
      <DialogActions>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogActions>
      <Box style={{ margin: 60 }}>
        <form onSubmit={onSubmit}>
          <Box style={{ marginLeft: 10 }}>
            <AvniFormLabel label={"Select Template"} required={true} />
            <Select
              placeholder={"Message template"}
              value={getSelectedTemplate(rules[0].messageTemplateId)}
              isDisabled={false}
              options={_.map(templates, template => ({ label: template.label, value: template }))}
              onChange={({ value }) => onRuleChange({ messageTemplateId: value.id })}
            />
          </Box>

          <Box style={{ marginTop: 20, marginLeft: 10 }}>
            {rules[0].messageTemplateId && <AvniFormLabel label={"Selected message template"} />}
            {rules[0].messageTemplateId && getSelectedTemplate(rules[0].messageTemplateId).body}
          </Box>

          <Box style={{ marginTop: 20, marginLeft: 10 }}>
            {_.size(rules[0].parameters) > 0 && (
              <AvniFormLabel label={"Enter variables for the selected template"} required={true} />
            )}
            {_.map(rules[0].parameters, (parameter, index) => {
              return (
                <AvniTextField
                  id={`variable_${index + 1}`}
                  label={`Variable ${index + 1}`}
                  required
                  autoComplete="off"
                  value={parameter}
                  onChange={event => onVariableChange(index, event.target.value)}
                />
              );
            })}
          </Box>

          <Box style={{ marginTop: 20, marginLeft: 10 }}>
            <AvniFormLabel label={"Schedule time to send message"} required={true} />
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDateTimePicker
                id="date-picker-dialog"
                placeholder="Date and Time"
                format={dateTimeFormat}
                value={rules[0].scheduledDateTime}
                onChange={value => onRuleChange({ scheduledDateTime: value })}
                style={{ width: "20%", marginRight: "1%" }}
                KeyboardButtonProps={{
                  "aria-label": "change date",
                  color: "primary"
                }}
              />
            </MuiPickersUtilsProvider>
          </Box>

          <DialogActions>
            <Button onClick={onClose} color="primary">
              Cancel
            </Button>
            <Button color="primary" variant="contained" disabled={!allFilled()} type="submit">
              Send Message
            </Button>
          </DialogActions>
        </form>
      </Box>
    </Dialog>
  );
};

export default ComposeMessageView;
