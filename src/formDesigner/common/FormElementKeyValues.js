// Keys already managed by dedicated controls in FormElementDetails.jsx —
// excluded from the generic Key/Value editor so they are never edited in two places.
export const EXCLUDED_FE_KEYVALUE_KEYS = [
  "IdSourceUUID",
  "unique",
  "groupSubjectTypeUUID",
  "groupSubjectRoleUUID",
  "editable",
  "datePickerMode",
  "timePickerMode",
  "maxHeight",
  "maxWidth",
  "imageQuality",
  "videoQuality",
  "durationLimitInSecs",
  "durationOptions",
  "regex",
  "descriptionKey",
  "repeatable",
  "disableManualActions",
  "textColour",
  "backgroundColour",
  "restrictGalleryUpload",
];

export function keyValueObjectToRows(keyValues, excludedKeys = []) {
  if (!keyValues) return [];
  return Object.keys(keyValues)
    .filter((key) => !excludedKeys.includes(key))
    .map((key) => ({ key, value: keyValues[key] }));
}
