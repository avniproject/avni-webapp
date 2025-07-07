import { useEffect } from "react";
import * as PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { getEligibleProgramEncounters, resetState } from "../../../reducers/programEncounterReducer";
import { getNewEligibleProgramEncounters } from "../../../../common/mapper/ProgramEncounterMapper";
import { isEmpty, size } from "lodash";
import { NewVisitLinkButton } from "./NewVisitLinkButton";

export function NewProgramEncounterButton({ enrolmentUUID }) {
  const programEncounterBaseURL = "/app/subject/programEncounter";

  const dispatch = useDispatch();
  const encounterTypes = useSelector(state => state.dataEntry.metadata.operationalModules.encounterTypes);
  const eligibleEncounters = useSelector(state => state.dataEntry.programEncounterReducer.eligibleEncounters);
  const { planEncounterList, unplanEncounterList } = getNewEligibleProgramEncounters(encounterTypes, eligibleEncounters);
  const allEncounters = [...planEncounterList, ...unplanEncounterList];

  useEffect(() => {
    dispatch(resetState());
    dispatch(getEligibleProgramEncounters(enrolmentUUID));
  }, []);

  if (isEmpty(allEncounters)) return null;
  if (size(allEncounters) === 1) {
    const encounter = allEncounters[0];
    const newVisitURL =
      size(planEncounterList) === 1
        ? `${programEncounterBaseURL}?encounterUuid=${encounter.uuid}`
        : `${programEncounterBaseURL}?enrolUuid=${enrolmentUUID}&uuid=${encounter.encounterType.uuid}`;
    return <NewVisitLinkButton label={encounter.encounterType.name} to={newVisitURL} />;
  }
  return <NewVisitLinkButton label={"newProgramVisit"} to={`/app/subject/newProgramVisit?enrolUuid=${enrolmentUUID}`} />;
}

NewProgramEncounterButton.propTypes = {
  enrolmentUUID: PropTypes.string
};
