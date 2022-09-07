import React, { useState } from "react";
import ReactMultiSelectCheckboxes from "react-multiselect-checkboxes";
import { updateUserAssignmentToSubject } from "./SubjectAssignmentData";

const SubjectAssignmentMultiSelect = props => {
  const [selectedOptions, setSelectedOptions] = useState(props.selectedOptions);

  function onChange(value, event) {
    updateUserAssignmentToSubject(event);
    //TODO how should we handle error of assignment/un-assignment
    this.setState(value);
  }

  return (
    <ReactMultiSelectCheckboxes
      options={props.options}
      placeholderButtonLabel="Assigned to"
      value={selectedOptions}
      onChange={onChange}
      setState={setSelectedOptions}
    />
  );
};

export default SubjectAssignmentMultiSelect;
