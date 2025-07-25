import { Fragment, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { Grid, Paper } from "@mui/material";
import { isEqual } from "lodash";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import {
  updateEncounter,
  resetState,
  createEncounter,
  createEncounterForScheduled,
  editEncounter,
  fetchEncounterRulesResponse,
  setEncounterDate
} from "dataEntryApp/reducers/encounterReducer";
import EncounterForm from "./EncounterForm";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";
import { DateFormElement } from "dataEntryApp/components/DateFormElement";
import StaticFormElement from "dataEntryApp/views/viewmodel/StaticFormElement";
import { AbstractEncounter } from "openchs-models";
import { LineBreak } from "../../../../common/components/utils";
import { useTranslation } from "react-i18next";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3, 2),
  margin: theme.spacing(1, 3),
  flexGrow: 1
}));

const StyledGrid = styled(Grid)({
  justifyContent: "center",
  alignItems: "center"
});

const Encounter = () => {
  const dispatch = useDispatch();
  const encounterForm = useSelector(
    state => state.dataEntry.encounterReducer.encounterForm
  );
  const subjectProfile = useSelector(
    state => state.dataEntry.subjectProfile.subjectProfile
  );
  const encounter = useSelector(
    state => state.dataEntry.encounterReducer.encounter
  );
  const validationResults = useSelector(
    state => state.dataEntry.encounterReducer.validationResults
  );

  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const encounterUuid = searchParams.get("encounterUuid");
  const subjectUuid = searchParams.get("subjectUuid");
  const uuid = searchParams.get("uuid");

  const editEncounterMode = isEqual(
    location.pathname,
    "/app/subject/editEncounter"
  );

  const { t } = useTranslation();

  useEffect(() => {
    dispatch(resetState());

    if (editEncounterMode) {
      dispatch(editEncounter(uuid));
    } else if (encounterUuid) {
      dispatch(createEncounterForScheduled(encounterUuid));
    } else {
      dispatch(createEncounter(uuid, subjectUuid));
    }
  }, [dispatch, editEncounterMode, encounterUuid, subjectUuid, uuid]);

  // Create a wrapper function for setEncounterDate to maintain compatibility
  const handleSetEncounterDate = date => {
    dispatch(setEncounterDate(date));
  };

  return (
    <Fragment>
      <Breadcrumbs path={location.pathname} />
      <StyledPaper>
        <StyledGrid container spacing={3}>
          <Grid size={12}>
            {encounterForm && encounter && subjectProfile ? (
              <EncounterForm fetchRulesResponse={fetchEncounterRulesResponse}>
                <DateFormElement
                  uuid={AbstractEncounter.fieldKeys.ENCOUNTER_DATE_TIME}
                  formElement={
                    new StaticFormElement(t("visitDate"), true, true)
                  }
                  value={encounter.encounterDateTime}
                  validationResults={validationResults}
                  update={handleSetEncounterDate}
                />
                <LineBreak num={3} />
              </EncounterForm>
            ) : (
              <CustomizedBackdrop load={false} />
            )}
          </Grid>
        </StyledGrid>
      </StyledPaper>
    </Fragment>
  );
};

export default Encounter;
