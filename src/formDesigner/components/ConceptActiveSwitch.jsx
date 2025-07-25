import { useEffect, useState } from "react";
import { httpClient as http } from "../../common/utils/httpClient";
import { AvniSwitch } from "../../common/components/AvniSwitch";
import _ from "lodash";

export const ConceptActiveSwitch = ({ active, handleActive, conceptUUID }) => {
  const [conceptUsage, setConceptUsage] = useState({});
  useEffect(() => {
    if (conceptUUID) {
      http
        .get("/web/concept/usage/" + conceptUUID)
        .then(response => setConceptUsage(response.data));
    }
  }, [conceptUUID]);

  return (
    <div>
      <AvniSwitch
        disabled={!_.isEmpty(conceptUsage.forms)}
        checked={!!active}
        onChange={handleActive}
        name="Active"
        toolTipKey={"APP_DESIGNER_CONCEPT_ACTIVE"}
      />
    </div>
  );
};
