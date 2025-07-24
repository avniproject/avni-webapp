import { localeChoices } from "../constants";
import { filter, sortBy } from "lodash";

export const getLocales = organisationConfig => {
  if (!organisationConfig) return [];

  const settings = organisationConfig.getSettings ? organisationConfig.getSettings() : organisationConfig.settings;

  if (!settings || !settings.languages) return [];

  return sortBy(filter(localeChoices, l => settings.languages.includes(l.id)), "name");
};
