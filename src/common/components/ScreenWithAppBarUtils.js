import _ from "lodash";

export const getSidebarLinkTo = (href) => {
  const path = href.startsWith("#") ? href.replace("#", "") : href;
  return `${path}?page=0`;
};

export const shouldUpdateSelectedIndexOnClick = (event) => !event.metaKey && !event.ctrlKey;

export const getSelectedListItem = (sidebarOptions) => {
  return _.isEmpty(sidebarOptions)
    ? 0
    : _.map(sidebarOptions, (option, i) => ({
        selected: window.location.href.includes(option.href.replace("#", "")),
        index: i,
      })).filter((option) => option.selected)[0]?.index || 0;
};
