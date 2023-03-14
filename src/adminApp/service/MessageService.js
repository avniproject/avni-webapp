import { get, isNil, isString } from "lodash";
import http from "../../common/utils/httpClient";

export const getMessageRules = (entityType, entityTypeId, dispatch) => {
  if (isString(entityType) && !isNil(entityTypeId)) {
    http
      .fetchJson(`/web/messageRule?entityType=${entityType}&entityTypeId=${entityTypeId}`)
      .then(response => response.json)
      .then(res => {
        dispatch({ type: "setRules", payload: get(res, "content", []) });
      });
  }
};

export const getMessageTemplates = dispatch => {
  http
    .fetchJson(`/web/messageTemplates`)
    .then(response => response.json)
    .then(payload => {
      dispatch({ type: "setTemplates", payload });
    });
};

export const saveMessageRules = (entityType, entityTypeId, rules = []) => {
  if (!entityType || !entityTypeId) {
    return;
  }

  const savePromises = rules.map(rule => {
    if (rule.voided && !rule.uuid) return Promise.resolve(); //Ignore locally added and deleted rules
    return http.post("/web/messageRule", {
      ...rule,
      entityType,
      entityTypeId
    });
  });

  return Promise.all(savePromises);
};

export const sendManualMessage = (receiverIds, receiverType, rule) => {
  return http.post("/web/scheduleManualMessage", {
    receiverIds,
    receiverType,
    ...rule
  });
};
