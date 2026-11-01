import { filter, isArray, isEmpty, isNil, isString, map, some } from "lodash";

export const imageV2MediaObjects = (value) => {
  if (isNil(value) || isEmpty(value)) return [];
  if (isArray(value)) return value;
  if (!isString(value)) return [];
  try {
    const parsed = JSON.parse(value);
    return isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

export const imageV2Uris = (value) =>
  filter(
    map(imageV2MediaObjects(value), (mediaObject) => mediaObject && mediaObject.uri),
    (uri) => !isEmpty(uri),
  );

export const toggleImageV2Uri = (value, uri, isMultiSelect) => {
  const mediaObjects = imageV2MediaObjects(value);
  const updated = some(mediaObjects, (mediaObject) => mediaObject.uri === uri)
    ? filter(mediaObjects, (mediaObject) => mediaObject.uri !== uri)
    : isMultiSelect
      ? [...mediaObjects, { uri }]
      : [{ uri }];
  return isEmpty(updated) ? null : JSON.stringify(updated);
};
