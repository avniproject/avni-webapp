import { toLower } from "lodash";

export const DEFAULT_SUBJECT_ICON_URL = "/icons/person.png";

// Returns the first subject type that carries a usable `.type` field, else null.
// Relationships (individualB on a Subject's profile) often arrive without a
// fully-populated subjectType payload, in which case `mapSubjectType` produces
// a fresh SubjectType with `type === undefined`. Callers fall back to the
// store lookup for the same subject type name, but that can also return
// undefined when operationalModules hasn't loaded yet.
export const resolveSubjectType = (preferred, fallback) => {
  if (preferred && preferred.type) return preferred;
  if (fallback && fallback.type) return fallback;
  return null;
};

export const resolveDefaultIconUrl = (subjectType) => {
  const key = subjectType && subjectType.type;
  return key ? `/icons/${toLower(key)}.png` : DEFAULT_SUBJECT_ICON_URL;
};

export const isProfilePictureEnabled = (subjectType) => !!(subjectType && subjectType.allowProfilePicture);
