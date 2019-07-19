import React from "react";
import DateComponent from "./concepts/DateComponent";
import MultiCodedComponent from "./concepts/MultiCodedComponent";
import SingleCodedComponent from "./concepts/SingleCodedComponent";
import NumericComponent from "./concepts/NumericComponent";

const fieldsMetadata = [
  {
    id: "groupField",
    icon: "object-group",
    label: "Group",
    type: "Group"
  },
  {
    dataType: "",
    component: () => <div />
  },
  {
    id: "textField",
    icon: "font",
    label: "Text",
    dataType: "Text",
    component: () => <div />
  },
  {
    id: "calendarField",
    icon: "calendar",
    label: "Date",
    dataType: "Date",
    component: (groupId, field, readOnly, handleKeyValuesChange) => (
      <DateComponent
        groupId={groupId}
        field={field}
        key={field.uuid}
        readOnly={readOnly}
        handleKeyValuesChange={handleKeyValuesChange}
      />
    )
  },
  {
    id: "multiCodedField",
    icon: "align-left",
    label: "Multiple choices",
    type: "MultiSelect",
    dataType: "Coded",
    component: (
      groupId,
      field,
      readOnly,
      handleKeyValuesChange,
      handleFieldChange
    ) => (
      <MultiCodedComponent
        groupId={groupId}
        field={field}
        key={field.uuid}
        readOnly={readOnly}
        handleKeyValuesChange={handleKeyValuesChange}
        handleFieldChange={handleFieldChange}
      />
    )
  },
  {
    id: "singleCodedField",
    icon: "list",
    label: "Multiple choices",
    type: "SingleSelect",
    dataType: "Coded",
    component: (
      groupId,
      field,
      readOnly,
      handleKeyValuesChange,
      handleFieldChange
    ) => (
      <SingleCodedComponent
        groupId={groupId}
        field={field}
        key={field.uuid}
        readOnly={readOnly}
        handleKeyValuesChange={handleKeyValuesChange}
        handleFieldChange={handleFieldChange}
      />
    )
  },
  {
    id: "numericField",
    icon: "circle-o-#",
    isStack: true,
    iconWrapper: "circle-o",
    iconContent: "#",
    label: "Number",
    dataType: "Numeric",
    component: (groupId, field, readOnly) => (
      <NumericComponent
        groupId={groupId}
        field={field}
        key={field.uuid}
        readOnly={readOnly}
      />
    )
  }
];

export default fieldsMetadata;
