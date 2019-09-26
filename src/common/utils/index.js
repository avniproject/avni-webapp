import { localeChoices } from "../constants";
import { filter, sortBy } from "lodash";

export const getLocales = organisationConfig =>
  sortBy(
    filter(localeChoices, l => organisationConfig.getSettings().languages.includes(l.id)),
    "name"
  );
