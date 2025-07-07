import { useState, Fragment, useEffect } from "react";
import { styled } from "@mui/material/styles";
import { Paper, Grid } from "@mui/material";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withParams } from "../../../../common/components/utils";
import { loadEncounters, loadProgramEncounters } from "../../../reducers/completedVisitsReducer";
import { useTranslation } from "react-i18next";
import FilterResult from "../components/FilterResult";
import CustomizedBackdrop from "../../../components/CustomizedBackdrop";
import CompletedVisitsTable from "dataEntryApp/views/subjectDashBoard/CompletedVisitsTable";
import { voidGeneralEncounter, voidProgramEncounter } from "../../../reducers/subjectDashboardReducer";
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

const CompleteVisit = ({
  entityUuid,
  isForProgramEncounters,
  encounterTypes,
  load,
  loadProgramEncounters,
  loadEncounters,
  voidGeneralEncounter,
  voidProgramEncounter
}) => {
  const { t } = useTranslation();
  const [filterParams, setFilterParams] = useState({});
  const [encounterUUID, setEncounterUUID] = useState();

  const filterQueryString = new URLSearchParams(filterParams).toString();

  const apiUrl = isForProgramEncounters ? `/web/programEnrolment/${entityUuid}/completed` : `/web/subject/${entityUuid}/completed`;
  const viewEncounterUrl = (action = "") =>
    isForProgramEncounters ? `/app/subject/view${action}ProgramEncounter` : `/app/subject/view${action}Encounter`;
  const editEncounterUrl = (action = "") =>
    isForProgramEncounters ? `/app/subject/edit${action}ProgramEncounter` : `/app/subject/edit${action}Encounter`;

  useEffect(() => {
    isForProgramEncounters ? loadProgramEncounters(entityUuid, filterQueryString) : loadEncounters(entityUuid, filterQueryString);
  }, [entityUuid, filterQueryString]);

  const voidEncounter = isForProgramEncounters ? voidProgramEncounter : voidGeneralEncounter;

  return encounterTypes && load ? (
    <Fragment>
      <StyledSearchBox>
        <StyledGrid container>
          <FilterResult encounterTypes={encounterTypes} setFilterParams={setFilterParams} />
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
            title={isForProgramEncounters ? t("ProgramEncounterVoidAlertTitle") : t("GeneralEncounterVoidAlertTitle")}
            open={encounterUUID !== undefined}
            setOpen={() => setEncounterUUID()}
            message={isForProgramEncounters ? t("ProgramEncounterVoidAlertMessage") : t("GeneralEncounterVoidAlertMessage")}
            onConfirm={() => voidEncounter(encounterUUID)}
          />
        </StyledTableBox>
      </StyledSearchBox>
    </Fragment>
  ) : (
    <CustomizedBackdrop load={load} />
  );
};

const mapStateToProps = state => ({
  encounterTypes: state.dataEntry.completedVisitsReducer.encounterTypes,
  load: state.dataEntry.loadReducer.load
});

const mapDispatchToProps = {
  loadEncounters,
  loadProgramEncounters,
  voidGeneralEncounter,
  voidProgramEncounter
};

export default withRouter(
  withParams(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(CompleteVisit)
  )
);
