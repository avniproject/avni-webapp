import { useEffect, useState } from "react";
import { includes, isArray } from "lodash";
import { CodedFormElement } from "./CodedFormElement";
import { loadEncounterOptions } from "../services/EncounterAnswerService";

export default function EncounterFormElement({
  formElement,
  value,
  update,
  validationResults,
  uuid,
  subjectUUID,
}) {
  const [options, setOptions] = useState([]);
  const isMultiSelect = formElement.isMultiSelect();

  useEffect(() => {
    let current = true;
    loadEncounterOptions(formElement, subjectUUID).then(
      (loaded) => current && setOptions(loaded),
    );
    return () => {
      current = false;
    };
  }, [
    formElement.uuid,
    subjectUUID,
    formElement.answersToShow,
    formElement.answersToExclude,
  ]);

  const isChecked = (option) =>
    isArray(value) ? includes(value, option.uuid) : value === option.uuid;

  return (
    <CodedFormElement
      groupName={formElement.name}
      name={formElement.name}
      items={options}
      isChecked={isChecked}
      onChange={(option) => option && update(option.uuid)}
      multiSelect={isMultiSelect}
      mandatory={formElement.mandatory}
      validationResults={validationResults}
      uuid={uuid}
    />
  );
}
