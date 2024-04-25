import React from "react";
import { useTranslation } from "react-i18next";
import { find, lowerCase } from "lodash";
import { ValidationError } from "./ValidationError";
import { MediaUploader } from "./MediaUploader";

export default function MediaFormElement({ formElement, value, update, validationResults, uuid }) {
  const { t } = useTranslation();
  const { mandatory, name } = formElement;
  const validationResult = find(
    validationResults,
    ({ formIdentifier, questionGroupIndex }) => formIdentifier === uuid && questionGroupIndex === formElement.questionGroupIndex
  );
  const label = `${t(name)} ${mandatory ? "*" : ""}`;

  return (
    <div>
      <MediaUploader
        mediaType={lowerCase(formElement.getType())}
        label={label}
        obsValue={value}
        update={update}
        formElement={formElement}
      />
      <ValidationError validationResult={validationResult} />
    </div>
  );
}
