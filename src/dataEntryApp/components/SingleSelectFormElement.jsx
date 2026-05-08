import { get, isNil } from "lodash";

import { CodedConceptFormElement } from "./CodedConceptFormElement";
import SyncAttributeCodedSingleSelect from "./SyncAttributeCodedSingleSelect";

export default ({
  formElement: fe,
  value,
  update,
  validationResults,
  uuid,
  allowedValues,
}) => {
  if (!isNil(allowedValues)) {
    return (
      <SyncAttributeCodedSingleSelect
        formElement={fe}
        allowedValues={allowedValues}
        value={value}
        update={update}
        validationResults={validationResults}
        uuid={uuid}
      />
    );
  }

  return (
    <CodedConceptFormElement
      isChecked={(answer) => value === answer.uuid}
      onChange={(answer) => {
        update(get(answer, "uuid"));
      }}
      validationResults={validationResults}
      uuid={uuid}
      mandatory={fe.mandatory}
    >
      {fe}
    </CodedConceptFormElement>
  );
};
