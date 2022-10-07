import { JSEditor } from "../../../common/components/JSEditor";
import { AvniFormLabel } from "../../../common/components/AvniFormLabel";
import React from "react";
import BorderBox from "../BorderBox";
import DeleteIcon from "@material-ui/icons/Delete";
import Button from "@material-ui/core/Button";
import { AvniTextField } from "../../../common/components/AvniTextField";
import Select from "react-select";
import { map } from "lodash";

const MessageRule = ({
  scheduleRule,
  messageRule,
  name,
  template,
  templates,
  onChange,
  onDelete,
  readOnly = false
}) => {
  return (
    <BorderBox>
      <Button
        style={{ float: "right", color: "red" }}
        onClick={() => onDelete()}
        disabled={readOnly}
      >
        <DeleteIcon />
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
      <AvniFormLabel
        label={"Select Template"}
        toolTipKey={"APP_DESIGNER_SELECT_MESSAGE_TEMPLATE"}
      />
      <Select
        placeholder={"Message template"}
        value={template}
        isDisabled={readOnly}
        options={map(templates, template => ({ label: template.label, value: template }))}
        onChange={({ value }) => onChange({ messageTemplateId: value.id })}
      />
      <AvniFormLabel label={"Schedule"} toolTipKey={"APP_DESIGNER_MESSAGE_SCHEDULE_RULE"} />
      <JSEditor
        readOnly={readOnly}
        value={scheduleRule}
        onValueChange={newRule => onChange({ scheduleRule: newRule })}
      />
      <AvniFormLabel label={"Message"} toolTipKey={"APP_DESIGNER_MESSAGE_RULE"} />
      <JSEditor
        readOnly={readOnly}
        value={messageRule}
        onValueChange={newRule => onChange({ messageRule: newRule })}
      />
    </BorderBox>
  );
};

export default MessageRule;
