import React, {useEffect, useReducer, useState} from "react";
import { getMessageTemplates } from "../../adminApp/service/MessageService";
import { MessageReducer } from "../../formDesigner/components/MessageRule/MessageReducer";
import _ from "lodash";
import {AvniFormLabel} from "../../common/components/AvniFormLabel";
import Select from "react-select";
import {KeyboardDateTimePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import {AvniTextField} from "../../common/components/AvniTextField";
import { sendBroadcastMessage } from "../../adminApp/service/MessageService";
import {Box, Dialog, DialogActions, DialogTitle, Button} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import {Close} from "@material-ui/icons";

const ComposeMessageView = ({selectedGroupIds, onClose}) => {

  const [{ rules, templates }, rulesDispatch] = useReducer(MessageReducer, {
    rules: [{}],
    templates: []
  });

  useEffect(() => {
    getMessageTemplates(rulesDispatch);
  }, []);

  const getNumberOfParametersForTemplate = (messageTemplateId) => {
    const template = getSelectedTemplate(messageTemplateId);
    const parameterArray = template.body.match(/{{[0-9]+}}/g);
    return parameterArray ? parameterArray.length : 0;
  }
  const onRuleChange = (updatedValues) => {
    if (_.has(updatedValues, 'messageTemplateId')) {
      const noOfParameters = getNumberOfParametersForTemplate(updatedValues.messageTemplateId)
      const parameters = Array.apply(null, Array(noOfParameters)).map(function () {return ''});
      updatedValues = {...updatedValues, parameters}
    }

    rules[0] = { ...rules[0], ...updatedValues};
    rulesDispatch({ type: "setRules", payload: rules });
  }

  const onVariableChange = (index, updatedValue) => {
    rules[0].parameters[index] = updatedValue;
    rulesDispatch({ type: "setRules", payload: rules });
  }

  const getSelectedTemplate = (selectedTemplateId) => {
    return _.find(templates, template => template.id === selectedTemplateId);
  }

  const dateTimeFormat = "dd/MM/yyyy HH:mm";
  const [error, setError] = useState("");

  const onSubmit = async event => {
    event.preventDefault();
    try {
      await sendBroadcastMessage(selectedGroupIds, rules[0]);
    } catch (e) {
      setError(error.response.data.message);
    }
  }

  return (<Dialog
      onClose={()=> {}}
      aria-labelledby="customized-dialog-title"
      open={true}
      fullScreen
    >
      <DialogTitle
        id="customized-dialog-title"
        onClose={onClose}
        style={{ backgroundColor: "black", color: "white" }}
      >
        Send Message
      </DialogTitle>
      <DialogActions>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogActions>
    <Box style={{ padding: 40 }}>
    <form onSubmit={onSubmit}>
    <AvniFormLabel
        label={"Select Template"}
        toolTipKey={"APP_DESIGNER_SELECT_MESSAGE_TEMPLATE"}
      />
      <Select
        placeholder={"Message template"}
        value={getSelectedTemplate(rules[0].messageTemplateId)}
        isDisabled={false}
        options={_.map(templates, template => ({ label: template.label, value: template }))}
        onChange={({ value }) => onRuleChange({ messageTemplateId: value.id })}
      />

      {rules[0].messageTemplateId &&
        <AvniFormLabel
          label={"Selected message template"}
          toolTipKey={"APP_DESIGNER_SELECT_MESSAGE_TEMPLATE"}
        />}
      {rules[0].messageTemplateId && getSelectedTemplate(rules[0].messageTemplateId).body}

      {_.size(rules[0].parameters) > 0 && <AvniFormLabel
        label={"Enter variables for the selected template"}
        toolTipKey={"APP_DESIGNER_SELECT_MESSAGE_TEMPLATE"}
      />}
      {_.map(rules[0].parameters, (parameter, index) => {
        return <AvniTextField
          id={`variable_${index + 1}`}
          label={`Variable ${index + 1}`}
          required
          autoComplete="off"
          value={parameter}
          onChange={(event) => onVariableChange(index, event.target.value)}
          toolTipKey={"APP_DESIGNER_SUBJECT_TYPE_NAME"}
        />
      })
      }

      <AvniFormLabel
        label={"Schedule time to send message"}
        toolTipKey={"APP_DESIGNER_SELECT_MESSAGE_TEMPLATE"}
      />
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDateTimePicker
        id="date-picker-dialog"
        placeholder="Date and Time"
        format={dateTimeFormat}
        value={rules[0].scheduledDateTime}
        onChange={(value) => onRuleChange({scheduledDateTime: value})}
        style={{ width: "14%", marginRight: "1%" }}
        KeyboardButtonProps={{
          "aria-label": "change date",
          color: "primary"
        }}
      />
      </MuiPickersUtilsProvider>
      <Button color="primary" variant="contained" type="submit">
        Send Message
      </Button>
      </form>
      </Box>
    </Dialog>
    )
}

export default ComposeMessageView;