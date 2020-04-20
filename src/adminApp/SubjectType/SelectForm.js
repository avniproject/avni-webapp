import DropDown from "../../common/components/DropDown";
import _ from "lodash";
import React from "react";

const SelectForm = ({ formList, subjectType, value, onChange }) => {
  const convertFormListForDisplay = (list = []) =>
    list.map(form => ({
      name: form.formName,
      value: form
    }));

  return (
    <DropDown
      name={"Please select"}
      value={value}
      onChange={selectedFormName =>
        onChange(_.find(formList, form => form.formName === selectedFormName))
      }
      options={convertFormListForDisplay(formList)}
    />
  );
};

export default SelectForm;
