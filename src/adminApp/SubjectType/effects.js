import { useEffect } from "react";
import http from "../../common/utils/httpClient";

export const useFormMappings = cb =>
  useEffect(() => {
    http
      .get("/web/operationalModules")
      .then(response => {
        const formMap = response.data.formMappings;
        formMap.map(l => (l["isVoided"] = false));
        cb(formMap, response.data.forms);
      })
      .catch(error => {});
  }, []);
