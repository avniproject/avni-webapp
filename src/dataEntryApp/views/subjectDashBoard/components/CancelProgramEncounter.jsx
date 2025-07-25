import { Fragment, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { Grid, Paper } from "@mui/material";
import { isEqual } from "lodash";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useSearchParams } from "react-router-dom";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import {
  updateProgramEncounter,
  resetState,
  createCancelProgramEncounter,
  editCancelProgramEncounter,
  fetchProgramEncounterRulesResponse
} from "../../../reducers/programEncounterReducer";
import CancelProgramEncounterForm from "./CancelProgramEncounterForm";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";
import { AbstractEncounter } from "openchs-models";
import StaticFormElement from "dataEntryApp/views/viewmodel/StaticFormElement";
import { DateFormElement } from "dataEntryApp/components/DateFormElement";
import { LineBreak } from "../../../../common/components/utils";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3, 2),
  margin: theme.spacing(1, 3),
  flexGrow: 1
}));

const CancelProgramEncounter = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const cancelProgramEncounterForm = useSelector(
    state => state.dataEntry.programEncounterReducer.programEncounterForm
  );
  const subjectProfile = useSelector(
    state => state.dataEntry.subjectProfile.subjectProfile
  );
  const programEncounter = useSelector(
    state => state.dataEntry.programEncounterReducer.programEncounter
  );

  const isEditCancelProgramEncounter = isEqual(
    location.pathname,
    "/app/subject/editCancelProgramEncounter"
  );
  const encounterUuid = searchParams.get("uuid");

  useEffect(() => {
    dispatch(resetState());
    if (isEditCancelProgramEncounter) {
      dispatch(editCancelProgramEncounter(encounterUuid));
    } else {
      dispatch(createCancelProgramEncounter(encounterUuid));
    }
  }, [dispatch, isEditCancelProgramEncounter, encounterUuid]);

  return (
    <Fragment>
      <Breadcrumbs path={location.pathname} />
      <StyledPaper>
        <Grid
          container
          spacing={3}
          sx={{
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Grid size={12}>
            {cancelProgramEncounterForm &&
            programEncounter &&
            subjectProfile ? (
              <CancelProgramEncounterForm
                fetchRulesResponse={fetchProgramEncounterRulesResponse}
              >
                <DateFormElement
                  uuid={AbstractEncounter.fieldKeys.ENCOUNTER_DATE_TIME}
                  formElement={
                    new StaticFormElement("Cancel Date", true, false)
                  }
                  value={programEncounter.cancelDateTime}
                />
                <LineBreak num={3} />
              </CancelProgramEncounterForm>
            ) : (
              <CustomizedBackdrop load={false} />
            )}
          </Grid>
        </Grid>
      </StyledPaper>
    </Fragment>
  );
};

export default CancelProgramEncounter;
