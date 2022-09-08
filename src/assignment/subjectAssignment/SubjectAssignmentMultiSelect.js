import React, { useState, useEffect } from "react";
import ReactMultiSelectCheckboxes from "react-multiselect-checkboxes";
import { updateUserAssignmentToSubject } from "./SubjectAssignmentData";
import _ from "lodash";

const SubjectAssignmentMultiSelect = props => {
  const [selectedOptions, setSelectedOptions] = useState(
    getSortedDropdownList(props.selectedOptions)
  );

  useEffect(() => {
    setSelectedOptions(getSortedDropdownList(props.selectedOptions));
  }, [props.selectedOptions]);

  function getSortedDropdownList(unsortedList) {
    return _.sortBy(unsortedList, [
      function(o) {
        return _.upperCase(o.label);
      }
    ]);
  }

  const onChange = (value, event) => {
    updateUserAssignmentToSubject(event)
      .then(setSelectedOptions(value))
      .catch(() =>
        alert(
          "Server side error! Refresh your page and resume. If the assignment has not happened, kindly try later."
        )
      );
  };

  function getDropdownButtonLabel({ placeholderButtonLabel, value }) {
    if (value.length === 0) {
      return placeholderButtonLabel;
    }
    return `Assigned to ${value.length} users: ${value
      .map(entry => entry.label)
      .join(", ")}`.substring(0, 255);
  }

  return (
    <ReactMultiSelectCheckboxes
      options={getSortedDropdownList(props.options)}
      value={selectedOptions}
      onChange={onChange}
      setState={setSelectedOptions}
      getDropdownButtonLabel={getDropdownButtonLabel}
    />
  );
};

export default SubjectAssignmentMultiSelect;
