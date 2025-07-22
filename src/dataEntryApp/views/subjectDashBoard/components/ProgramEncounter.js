import { Fragment, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { Grid, Paper } from "@mui/material";
import { isEqual } from "lodash";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import {
  editProgramEncounter,
  resetState,
  createProgramEncounter,
  createProgramEncounterForScheduled,
  fetchProgramEncounterRulesResponse,
  setEncounterDate
} from "../../../reducers/programEncounterReducer";
import ProgramEncounterForm from "./ProgramEncounterForm";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";
import { AbstractEncounter } from "openchs-models";
import StaticFormElement from "dataEntryApp/views/viewmodel/StaticFormElement";
import { DateFormElement } from "dataEntryApp/components/DateFormElement";
import { LineBreak } from "../../../../common/components/utils";
import { useTranslation } from "react-i18next";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3, 2),
  margin: theme.spacing(1, 3),
  flexGrow: 1
}));

const StyledGrid = styled(Grid)(({ theme }) => ({
  container: true,
  spacing: theme.spacing(3),
  justifyContent: "center",
  alignItems: "center"
}));

const ProgramEncounter = () => {
  const { t } = useTranslation();

  const location = useLocation();

  // Parse query parameters from location.search
  const searchParams = new URLSearchParams(location.search);
  const encounterUuid = searchParams.get("encounterUuid");
  const enrolUuid = searchParams.get("enrolUuid");
  const uuid = searchParams.get("uuid");
  const path = location.pathname;

  const dispatch = useDispatch();
  const programEncounterForm = useSelector(state => state.dataEntry.programEncounterReducer.programEncounterForm);
  const subjectProfile = useSelector(state => state.dataEntry.subjectProfile.subjectProfile);
  const programEncounter = useSelector(state => state.dataEntry.programEncounterReducer.programEncounter);
  const validationResults = useSelector(state => state.dataEntry.programEncounterReducer.validationResults);

  const editProgramEncounterFlow = isEqual(path, "/app/subject/editProgramEncounter");

  const handleEditProgramEncounter = (...args) => dispatch(editProgramEncounter(...args));
  const handleResetState = () => dispatch(resetState());
  const handleCreateProgramEncounter = (...args) => dispatch(createProgramEncounter(...args));
  const handleCreateProgramEncounterForScheduled = (...args) => dispatch(createProgramEncounterForScheduled(...args));
  const handleSetEncounterDate = (...args) => dispatch(setEncounterDate(...args));

  useEffect(() => {
    handleResetState();
    if (editProgramEncounterFlow) {
      handleEditProgramEncounter(uuid);
    } else if (encounterUuid) {
      handleCreateProgramEncounterForScheduled(encounterUuid);
    } else {
      handleCreateProgramEncounter(uuid, enrolUuid);
    }
  }, [editProgramEncounterFlow, uuid, encounterUuid, enrolUuid]);

  return (
    <Fragment>
      <Breadcrumbs path={path} />
      <StyledPaper>
        <StyledGrid size={12}>
          {programEncounterForm && programEncounter && subjectProfile ? (
            <ProgramEncounterForm fetchRulesResponse={fetchProgramEncounterRulesResponse}>
              <DateFormElement
                uuid={AbstractEncounter.fieldKeys.ENCOUNTER_DATE_TIME}
                formElement={new StaticFormElement(t("visitDate"), true, true)}
                value={programEncounter.encounterDateTime}
                validationResults={validationResults}
                update={handleSetEncounterDate}
              />
              <LineBreak num={3} />
            </ProgramEncounterForm>
          ) : (
            <CustomizedBackdrop load={false} />
          )}
        </StyledGrid>
      </StyledPaper>
    </Fragment>
  );
};

export default ProgramEncounter;
