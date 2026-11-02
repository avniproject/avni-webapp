export const withUserTimeZone = (searchRequest) => ({
  ...searchRequest,
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
});
