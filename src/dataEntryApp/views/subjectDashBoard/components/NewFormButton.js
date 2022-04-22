import React from "react";
import Grid from "@material-ui/core/Grid";
import { filter, isEmpty, isNil } from "lodash";
import SubjectButton from "./Button";
import { InternalLink } from "common/components/utils";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { selectFormMappingsForSubjectType } from "../../../sagas/encounterSelector";

export const NewFormButton = ({
  general,
  subjectTypeUuid,
  subjectUuid,
  subjectVoided,
  display = false
}) => {
  const encounterFormMappings = useSelector(selectFormMappingsForSubjectType(subjectTypeUuid));
  const { t } = useTranslation();
  const plannedVisits = filter(
    general,
    ({ voided, encounterDateTime, cancelDateTime }) =>
      !voided && isNil(encounterDateTime) && isNil(cancelDateTime)
  );

  const renderButton = () => (
    <Grid container justify="flex-end">
      {!(isEmpty(plannedVisits) && isEmpty(encounterFormMappings)) && !subjectVoided ? (
        <InternalLink
          to={`/app/subject/newGeneralVisit?subjectUuid=${subjectUuid}`}
          noUnderline
          id={"new-general-visit"}
        >
          <SubjectButton btnLabel={t("newGeneralVisit")} />
        </InternalLink>
      ) : (
        ""
      )}
    </Grid>
  );

  return display ? renderButton() : null;
};
