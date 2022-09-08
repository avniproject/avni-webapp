import React, { useEffect } from "react";
import Grid from "@material-ui/core/Grid";
import { isEmpty, size } from "lodash";
import SubjectButton from "./Button";
import { InternalLink } from "common/components/utils";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { getEligibleEncounters, resetState } from "../../../reducers/encounterReducer";
import { getNewEligibleEncounters } from "../../../../common/mapper/EncounterMapper";

export const NewGeneralEncounterButton = ({ subjectUuid, subjectVoided, display = false }) => {
  const newEncounterBaseURL = "/app/subject/encounter";
  const dispatch = useDispatch();
  const eligibleEncounters = useSelector(
    state => state.dataEntry.encounterReducer.eligibleEncounters
  );
  const encounterTypes = useSelector(
    state => state.dataEntry.metadata.operationalModules.encounterTypes
  );
  const { t } = useTranslation();
  const { scheduledEncounters, unplannedEncounters } = getNewEligibleEncounters(
    encounterTypes,
    eligibleEncounters
  );

  useEffect(() => {
    dispatch(getEligibleEncounters(subjectUuid));
    dispatch(resetState());
  }, []);

  const renderNewVisitButton = (to, label) => (
    <Grid container justify="flex-end">
      <InternalLink to={to} noUnderline id={"new-general-visit"}>
        <SubjectButton btnLabel={t(label)} />
      </InternalLink>
    </Grid>
  );

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
      return renderNewVisitButton(newVisitURL, encounter.encounterType.name);
    }
    return renderNewVisitButton(
      `/app/subject/newGeneralVisit?subjectUuid=${subjectUuid}`,
      "newGeneralVisit"
    );
  };

  return display && !subjectVoided ? renderBasedOnOptions() : null;
};
