import { useEffect, useMemo } from "react";
import { assign, get, isNil, sortBy } from "lodash";
import { useTranslation } from "react-i18next";

import { CodedFormElement } from "./CodedFormElement";
import { SyncReadOnlyMessage } from "./SyncReadOnlyMessage";

export default ({
  formElement: fe,
  allowedValues,
  value,
  update,
  validationResults,
  uuid,
}) => {
  const { t } = useTranslation();
  const editable = !!fe.editable;

  const filteredAnswers = useMemo(
    () =>
      sortBy(fe.getAnswers(), "answerOrder").filter((answer) =>
        allowedValues.includes(answer.concept.uuid),
      ),
    [fe, allowedValues],
  );

  const onlyOne = filteredAnswers.length === 1;
  const empty = filteredAnswers.length === 0;
  const persistedOutsideAllowed =
    !isNil(value) && !filteredAnswers.some((a) => a.concept.uuid === value);

  useEffect(() => {
    if (onlyOne && editable && isNil(value)) {
      update(filteredAnswers[0].concept.uuid);
    }
  }, [onlyOne, editable, value, filteredAnswers, update]);

  const items = useMemo(
    () =>
      filteredAnswers.map((answer) =>
        assign(answer.concept, { abnormal: answer.abnormal }),
      ),
    [filteredAnswers],
  );

  if (persistedOutsideAllowed) {
    const lookupAnswerName = (uuid) => {
      if (fe.getAnswerWithConceptUuid) {
        const answer = fe.getAnswerWithConceptUuid(uuid);
        if (answer && answer.concept && answer.concept.name)
          return answer.concept.name;
      }
      const allAnswers =
        (fe.concept && fe.concept.getAnswers && fe.concept.getAnswers()) || [];
      const match = allAnswers.find(
        (a) => a.concept && a.concept.uuid === uuid,
      );
      return match && match.concept ? match.concept.name : null;
    };
    const answerName = lookupAnswerName(value);
    const badgeText = answerName
      ? t(answerName)
      : t(
          "syncAttributeValueNotAvailable",
          "Selected value is no longer available",
        );
    return (
      <SyncReadOnlyMessage
        label={fe.name}
        mandatory={fe.mandatory}
        badgeText={badgeText}
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

  return (
    <CodedFormElement
      name={fe.name}
      items={items}
      multiSelect={false}
      isChecked={(item) => value === item.uuid}
      onChange={(item) => update(get(item, "uuid"))}
      mandatory={fe.mandatory}
      validationResults={validationResults.filter(
        (v) => v.questionGroupIndex === fe.questionGroupIndex,
      )}
      uuid={uuid}
      disabled={!editable || onlyOne}
    />
  );
};
