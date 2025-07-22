import { Fragment, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { Grid, Paper } from "@mui/material";
import { isEqual } from "lodash";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useSearchParams } from "react-router-dom";
import Breadcrumbs from "dataEntryApp/components/Breadcrumbs";
import {
  createCancelEncounter,
  editCancelEncounter,
  updateEncounter,
  resetState,
  fetchEncounterRulesResponse
} from "../../../reducers/encounterReducer";
import CancelEncounterForm from "./CancelEncounterForm";
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

const CancelEncounter = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const cancelEncounterForm = useSelector(state => state.dataEntry.encounterReducer.encounterForm);
  const subjectProfile = useSelector(state => state.dataEntry.subjectProfile.subjectProfile);
  const encounter = useSelector(state => state.dataEntry.encounterReducer.encounter);

  const isEditCancelEncounter = isEqual(location.pathname, "/app/subject/editCancelEncounter");
  const encounterUuid = searchParams.get("uuid");

  useEffect(() => {
    dispatch(resetState());
    if (isEditCancelEncounter) {
      dispatch(editCancelEncounter(encounterUuid));
    } else {
      dispatch(createCancelEncounter(encounterUuid));
    }
  }, [dispatch, isEditCancelEncounter, encounterUuid]);

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
            {cancelEncounterForm && encounter && subjectProfile ? (
              <CancelEncounterForm fetchRulesResponse={fetchEncounterRulesResponse}>
                <DateFormElement
                  uuid={AbstractEncounter.fieldKeys.ENCOUNTER_DATE_TIME}
                  formElement={new StaticFormElement("Cancel Date", true, false)}
                  value={encounter.cancelDateTime}
                />
                <LineBreak num={3} />
              </CancelEncounterForm>
            ) : (
              <CustomizedBackdrop load={false} />
            )}
          </Grid>
        </Grid>
      </StyledPaper>
    </Fragment>
  );
};

export default CancelEncounter;
