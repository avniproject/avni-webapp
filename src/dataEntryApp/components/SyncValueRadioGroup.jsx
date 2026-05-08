import { useEffect } from "react";
import { isNil, toString } from "lodash";
import { CodedFormElement } from "./CodedFormElement";
import { SyncReadOnlyMessage } from "./SyncReadOnlyMessage";

const persistedValueOutsideAllowed = (value, allowedValues) =>
  !isNil(value) &&
  toString(value) !== "" &&
  !allowedValues.some((av) => toString(av) === toString(value));

export const SyncValueRadioGroup = ({
  formElement: fe,
  allowedValues,
  value,
  update,
  validationResults,
  uuid,
}) => {
  const editable = !!fe.editable;
  const onlyOne = allowedValues.length === 1;
  const empty = allowedValues.length === 0;

  useEffect(() => {
    if (onlyOne && editable && isNil(value)) {
      update(allowedValues[0]);
    }
  }, [onlyOne, editable, value, allowedValues, update]);

  if (persistedValueOutsideAllowed(value, allowedValues)) {
    return (
      <SyncReadOnlyMessage
        label={fe.name}
        mandatory={fe.mandatory}
        badgeText={toString(value)}
        helperKey={empty ? "noAllowedSyncValuesForUser" : undefined}
      />
    );
  }

  if (empty) {
    return (
      <SyncReadOnlyMessage
        label={fe.name}
        mandatory={fe.mandatory}
        helperKey="noAllowedSyncValuesForUser"
      />
    );
  }

  const items = allowedValues.map((v) => ({
    uuid: toString(v),
    name: toString(v),
  }));

  return (
    <CodedFormElement
      name={fe.name}
      items={items}
      multiSelect={false}
      isChecked={(item) => toString(value) === item.uuid}
      onChange={(item) => update(item.uuid)}
      mandatory={fe.mandatory}
      validationResults={validationResults}
      uuid={uuid}
      disabled={!editable || onlyOne}
    />
  );
};
