import { JSEditor } from "../../../common/components/JSEditor";
import { AvniFormLabel } from "../../../common/components/AvniFormLabel";
import React from "react";
import BorderBox from "../BorderBox";
import { Delete } from "@mui/icons-material";
import { Button } from "@mui/material";
import { AvniTextField } from "../../../common/components/AvniTextField";
import Select from "react-select";
import { map } from "lodash";
import RadioButtonsGroup from "../../../dataEntryApp/components/RadioButtonsGroup";

const MessageRule = ({
  scheduleRule,
  messageRule,
  name,
  template,
  templates,
  receiverType,
  onChange,
  onDelete,
  readOnly = false,
  fixedReceiverType = null
}) => {
  const receiverTypes = [{ id: "Subject", name: "Subject" }, { id: "User", name: "User" }];

  return (
    <BorderBox>
      <Button style={{ float: "right", color: "red" }} onClick={() => onDelete()} disabled={readOnly}>
        <Delete />
      </Button>
      <AvniTextField
        id="name"
        label="Name"
        required
        autoComplete="off"
        value={name}
        onChange={event => onChange({ name: event.target.value })}
        toolTipKey={"APP_DESIGNER_SUBJECT_TYPE_NAME"}
      />
      <AvniFormLabel label={"Select Template"} toolTipKey={"APP_DESIGNER_SELECT_MESSAGE_TEMPLATE"} />
      <Select
        placeholder={"Message template"}
        value={template}
        isDisabled={readOnly}
        options={map(templates, template => ({ label: template.label, value: template }))}
        onChange={({ value }) => onChange({ messageTemplateId: value.id })}
      />
      <RadioButtonsGroup
        label={"Receiver Type"}
        items={receiverTypes}
        disabled={fixedReceiverType ? true : false}
        value={!fixedReceiverType ? receiverType : fixedReceiverType}
        onChange={value => onChange({ receiverType: value.id })}
        toolTipKey={"APP_DESIGNER_SELECT_RECEIVER_TYPE"}
      />
      <AvniFormLabel label={"Schedule"} toolTipKey={"APP_DESIGNER_MESSAGE_SCHEDULE_RULE"} />
      <JSEditor readOnly={readOnly} value={scheduleRule} onValueChange={newRule => onChange({ scheduleRule: newRule })} />
      <AvniFormLabel label={"Message"} toolTipKey={"APP_DESIGNER_MESSAGE_RULE"} />
      <JSEditor readOnly={readOnly} value={messageRule} onValueChange={newRule => onChange({ messageRule: newRule })} />
    </BorderBox>
  );
};

export default MessageRule;
