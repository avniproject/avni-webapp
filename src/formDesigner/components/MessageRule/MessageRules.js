import React from "react";
import MessageRule from "./MessageRule";
import IconButton from "../IconButton";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import { sampleMessageRule, sampleMessageScheduleRule } from "../../common/SampleRule";
import FormLabel from "@material-ui/core/FormLabel";
import { find } from "lodash";

const MessageRules = ({
  rules = [],
  templates = [],
  onChange,
  entityType,
  entityTypeId,
  readOnly = false
}) => {
  const updateRules = index => newRule => {
    const newState = [...rules];
    newState[index] = { ...rules[index], ...newRule, entityType, entityTypeId };
    onChange(newState);
  };

  const onDelete = index => () => {
    const newState = [...rules];
    newState[index].voided = true;
    onChange(newState);
  };

  if (readOnly && rules.length === 0) {
    return null;
  }
  return (
    <>
      <div>
        <FormLabel style={{ fontSize: "13px" }}>Message Rules</FormLabel>
      </div>
      {rules.map(({ scheduleRule, messageRule, name, messageTemplateId, receiverType, voided }, index) => {
        const template = find(templates, template => template.id === messageTemplateId);
        return voided === false ? (
          <MessageRule
            key={index}
            readOnly={readOnly}
            template={template}
            templates={templates}
            scheduleRule={scheduleRule}
            messageRule={messageRule}
            name={name}
            receiverType={receiverType}
            onChange={updateRules(index)}
            onDelete={onDelete(index)}
          />
        ) : null;
      })}
      {!readOnly && (
        <IconButton
          Icon={AddCircleIcon}
          label={"Add new message rule"}
          onClick={() =>
            updateRules(rules.length)({
              scheduleRule: sampleMessageScheduleRule(),
              messageRule: sampleMessageRule(),
              voided: false
            })
          }
          disabled={false}
        />
      )}
    </>
  );
};

export default MessageRules;
