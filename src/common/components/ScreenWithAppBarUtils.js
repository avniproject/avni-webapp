import _ from "lodash";

export const getSidebarLinkTo = (href) => {
  const path = href.startsWith("#") ? href.replace("#", "") : href;
  return `${path}?page=0`;
};

export const shouldUpdateSelectedIndexOnClick = (event) => !event.metaKey && !event.ctrlKey;

export const getSelectedListItem = (sidebarOptions, location = window.location) => {
  if (_.isEmpty(sidebarOptions)) return 0;

  const normalizePath = (value = "") =>
    value
      .replace(/^#\/?/, "")
      .replace(/^\//, "")
      .replace(/[?#].*$/, "")
      .replace(/\/$/, "");

  const pathname = normalizePath(location.pathname);
  const hashPath = normalizePath(location.hash);
  const currentPath = hashPath || pathname;

  const matchIndex = _.findIndex(sidebarOptions, (option) => {
    const optionPath = normalizePath(option.href);
    return currentPath === optionPath;
  });

  return matchIndex >= 0 ? matchIndex : 0;
};
