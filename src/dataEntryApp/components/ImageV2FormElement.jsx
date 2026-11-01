import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { find } from "lodash";
import { ValidationError } from "./ValidationError";
import { MediaUploader } from "./MediaUploader";
import { imageV2Uris, toggleImageV2Uri } from "../utils/ImageV2Value";

export default function ImageV2FormElement({
  formElement,
  value,
  update,
  validationResults,
  uuid,
}) {
  const { t } = useTranslation();
  const { mandatory, name } = formElement;
  const isMultiSelect = formElement.isMultiSelect();
  const latestValue = useRef(value);
  useEffect(() => {
    latestValue.current = value;
  }, [value]);
  const validationResult = find(
    validationResults,
    ({ formIdentifier, questionGroupIndex }) =>
      formIdentifier === uuid &&
      questionGroupIndex === formElement.questionGroupIndex,
  );
  const label = `${t(name)} ${mandatory ? "*" : ""}`;
  const uris = imageV2Uris(value);
  // MediaUploader reports each upload and each removal as one address, and several uploads can
  // finish before the form re-renders, so each one is applied to the latest answer, not the rendered one.
  const toggleUri = (uri) => {
    latestValue.current = toggleImageV2Uri(
      latestValue.current,
      uri,
      isMultiSelect,
    );
    update(latestValue.current);
  };

  return (
    <div>
      <MediaUploader
        mediaType="image"
        label={label}
        obsValue={isMultiSelect ? uris : uris[0]}
        update={toggleUri}
        formElement={formElement}
      />
      <ValidationError validationResult={validationResult} />
    </div>
  );
}
