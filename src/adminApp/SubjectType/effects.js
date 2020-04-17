import { useEffect } from "react";
import http from "../../common/utils/httpClient";

export const requireFormMappings = setFormMappings =>
  useEffect(() => {
    http
      .get("/web/operationalModules")
      .then(response => {
        const formMap = response.data.formMappings;
        formMap.map(l => (l["isVoided"] = false));
        setFormMappings(formMap);
      })
      .catch(error => {});
  }, []);
