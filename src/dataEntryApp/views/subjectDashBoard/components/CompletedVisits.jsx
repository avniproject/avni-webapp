import { useState, Fragment, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { Paper, Grid } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import {
  loadEncounters,
  loadProgramEncounters
} from "../../../reducers/completedVisitsReducer";
import { useTranslation } from "react-i18next";
import FilterResult from "../components/FilterResult";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";
import CompletedVisitsTable from "dataEntryApp/views/subjectDashBoard/CompletedVisitsTable";
import {
  voidGeneralEncounter,
  voidProgramEncounter
} from "../../../reducers/subjectDashboardReducer";
import ConfirmDialog from "../../../components/ConfirmDialog";

const StyledSearchBox = styled(Paper)({
  padding: "1.5rem",
  margin: "0rem 1rem"
});

const StyledTableBox = styled(Paper)({
  padding: "1.5rem"
});

const StyledGrid = styled(Grid)({
  justifyContent: "flex-end"
});

const CompleteVisit = ({ entityUuid, isForProgramEncounters }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const encounterTypes = useSelector(
    state => state.dataEntry.completedVisitsReducer.encounterTypes
  );
  const load = useSelector(state => state.dataEntry.loadReducer.load);

  const [filterParams, setFilterParams] = useState({});
  const [encounterUUID, setEncounterUUID] = useState();

  const filterQueryString = new URLSearchParams(filterParams).toString();

  const apiUrl = isForProgramEncounters
    ? `/web/programEnrolment/${entityUuid}/completed`
    : `/web/subject/${entityUuid}/completed`;
  const viewEncounterUrl = (action = "") =>
    isForProgramEncounters
      ? `/app/subject/view${action}ProgramEncounter`
      : `/app/subject/view${action}Encounter`;
  const editEncounterUrl = (action = "") =>
    isForProgramEncounters
      ? `/app/subject/edit${action}ProgramEncounter`
      : `/app/subject/edit${action}Encounter`;

  useEffect(() => {
    if (isForProgramEncounters) {
      dispatch(loadProgramEncounters(entityUuid, filterQueryString));
    } else {
      dispatch(loadEncounters(entityUuid, filterQueryString));
    }
  }, [dispatch, entityUuid, filterQueryString, isForProgramEncounters]);

  const handleVoidEncounter = encounterUuid => {
    if (isForProgramEncounters) {
      dispatch(voidProgramEncounter(encounterUuid));
    } else {
      dispatch(voidGeneralEncounter(encounterUuid));
    }
  };

  return encounterTypes && load ? (
    <Fragment>
      <StyledSearchBox>
        <StyledGrid container>
          <FilterResult
            encounterTypes={encounterTypes}
            setFilterParams={setFilterParams}
          />
        </StyledGrid>
        <StyledTableBox>
          <CompletedVisitsTable
            apiUrl={apiUrl}
            viewEncounterUrl={viewEncounterUrl}
            filterParams={filterParams}
            editEncounterUrl={editEncounterUrl}
            isForProgramEncounters={isForProgramEncounters}
            onDelete={encounter => setEncounterUUID(encounter.uuid)}
          />
          <ConfirmDialog
            title={
              isForProgramEncounters
                ? t("ProgramEncounterVoidAlertTitle")
                : t("GeneralEncounterVoidAlertTitle")
            }
            open={encounterUUID !== undefined}
            setOpen={() => setEncounterUUID()}
            message={
              isForProgramEncounters
                ? t("ProgramEncounterVoidAlertMessage")
                : t("GeneralEncounterVoidAlertMessage")
            }
            onConfirm={() => handleVoidEncounter(encounterUUID)}
          />
        </StyledTableBox>
      </StyledSearchBox>
    </Fragment>
  ) : (
    <CustomizedBackdrop load={load} />
  );
};

export default CompleteVisit;
