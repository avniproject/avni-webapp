import React from "react";
import MessageRule from "./MessageRule";
import IconButton from "../IconButton";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import { sampleMessageRule, sampleMessageScheduleRule } from "../../common/SampleRule";
import FormLabel from "@material-ui/core/FormLabel";
import { find } from "lodash";
import { Typography } from "@material-ui/core";

const MessageRules = ({
  rules = [],
  templates = [],
  onChange,
  entityType,
  entityTypeId,
  readOnly = false,
  fixedReceiverType = null,
  templateFetchError,
  msgError
}) => {
  const updateRules = index => newRule => {
    const newState = [...rules];
    newState[index] = {
      ...rules[index],
      receiverType: fixedReceiverType,
      ...newRule,
      entityType,
      entityTypeId
    };
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
      {templateFetchError && <Typography color={"textPrimary"}>NO MESSAGE TEMPLATE. OR UNABLE FETCH MESSAGE TEMPLATES.</Typography>}
      {!templateFetchError && (
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
                receiverType={!fixedReceiverType ? receiverType : fixedReceiverType}
                onChange={updateRules(index)}
                onDelete={onDelete(index)}
                fixedReceiverType={fixedReceiverType}
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
                  messageRule: sampleMessageRule(entityType, fixedReceiverType),
                  voided: false
                })
              }
              disabled={false}
            />
          )}
          {msgError && msgError !== "" && (
            <FormLabel error style={{ marginTop: "10px", fontSize: "12px" }}>
              {msgError}
            </FormLabel>
          )}
        </>
      )}
    </>
  );
};

export default MessageRules;
