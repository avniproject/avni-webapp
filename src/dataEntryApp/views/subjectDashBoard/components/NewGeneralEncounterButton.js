import React, { useEffect } from "react";
import { isEmpty, size } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import { getEligibleEncounters, resetState } from "../../../reducers/encounterReducer";
import { getNewEligibleEncounters } from "../../../../common/mapper/EncounterMapper";
import { NewVisitLinkButton } from "./NewVisitLinkButton";

export const NewGeneralEncounterButton = ({ subjectUuid, subjectVoided, display = false }) => {
  const newEncounterBaseURL = "/app/subject/encounter";
  const dispatch = useDispatch();
  const eligibleEncounters = useSelector(
    state => state.dataEntry.encounterReducer.eligibleEncounters
  );
  const encounterTypes = useSelector(
    state => state.dataEntry.metadata.operationalModules.encounterTypes
  );
  const { scheduledEncounters, unplannedEncounters } = getNewEligibleEncounters(
    encounterTypes,
    eligibleEncounters
  );

  useEffect(() => {
    dispatch(resetState());
    dispatch(getEligibleEncounters(subjectUuid));
  }, []);

  const renderBasedOnOptions = () => {
    const allEncounters = [...unplannedEncounters, ...scheduledEncounters];
    if (isEmpty(allEncounters)) return null;
    if (size(allEncounters) === 1) {
      const encounter = allEncounters[0];
      const newVisitURL =
        size(scheduledEncounters) === 1
          ? `${newEncounterBaseURL}?encounterUuid=${encounter.uuid}`
          : `${newEncounterBaseURL}?subjectUuid=${subjectUuid}&uuid=${
              encounter.encounterType.uuid
            }`;
      return <NewVisitLinkButton label={encounter.encounterType.name} to={newVisitURL} />;
    }
    return (
      <NewVisitLinkButton
        label={"newGeneralVisit"}
        to={`/app/subject/newGeneralVisit?subjectUuid=${subjectUuid}`}
      />
    );
  };

  return display && !subjectVoided ? renderBasedOnOptions() : null;
};
