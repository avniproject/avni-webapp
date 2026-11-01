import { useEffect, useState } from "react";
import { flatten, join } from "lodash";
import { loadEncounterAnswerLabels } from "../services/EncounterAnswerService";

export const EncounterObservationValue = ({ observation }) => {
  const [labels, setLabels] = useState([]);
  const encounterUUIDs = flatten([observation.getValueWrapper().getValue()]);
  const key = join(encounterUUIDs, ",");
  useEffect(() => {
    let current = true;
    loadEncounterAnswerLabels(observation.concept, encounterUUIDs).then(
      (loaded) => current && setLabels(loaded),
    );
    return () => {
      current = false;
    };
  }, [key]);
  return <span>{join(labels, ", ")}</span>;
};
