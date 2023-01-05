import React, {useEffect, useReducer, useState} from "react";
import { getMessageTemplates } from "../../adminApp/service/MessageService";
import { MessageReducer } from "../../formDesigner/components/MessageRule/MessageReducer";
import {find, map} from "lodash";
import {AvniFormLabel} from "../../common/components/AvniFormLabel";
import Select from "react-select";
import {useLocation} from "react-router-dom";
import {KeyboardDateTimePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
const ComposeMessageView = () => {

  const [{ rules, templates }, rulesDispatch] = useReducer(MessageReducer, {
    rules: [],
    templates: []
  });

  useEffect(() => {
    getMessageTemplates(rulesDispatch);
    console.log(templates);
  }, []);

  const onRuleChange = (updatedValues) => {
    const newState = [...rules];
    newState[0] = { ...rules[0], ...updatedValues};
    rulesDispatch({ type: "setRules", payload: newState });
  }

  const getSelectedTemplate = () => {
    return find(templates, template => template.id === (rules[0] && rules[0].messageTemplateId));
  }

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const groupIds = queryParams.get('groupIds');

  const dateTimeFormat = "dd/MM/yyyy HH:mm";

  return (<div className="container">
      <AvniFormLabel
        label={"Select Template"}
        toolTipKey={"APP_DESIGNER_SELECT_MESSAGE_TEMPLATE"}
      />
      <Select
        placeholder={"Message template"}
        value={getSelectedTemplate()}
        isDisabled={false}
        options={map(templates, template => ({ label: template.label, value: template }))}
        onChange={({ value }) => onRuleChange({ messageTemplateId: value.id })}
      />
      <AvniFormLabel
        label={"Schedule time to send message"}
        toolTipKey={"APP_DESIGNER_SELECT_MESSAGE_TEMPLATE"}
      />
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDateTimePicker
        id="date-picker-dialog"
        placeholder="Date and Time"
        format={dateTimeFormat}
        value={rules[0] && rules[0].scheduledDateTime}
        onChange={(value) => onRuleChange({scheduledDateTime: value})}
        style={{ width: "14%", marginRight: "1%" }}
        KeyboardButtonProps={{
          "aria-label": "change date",
          color: "primary"
        }}
      />
      </MuiPickersUtilsProvider>
    </div>
    )
}

export default ComposeMessageView;