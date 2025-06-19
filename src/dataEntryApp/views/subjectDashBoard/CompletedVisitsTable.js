import React, { useState, useEffect, useCallback, useMemo } from "react";
import { makeStyles } from "@mui/styles";
import { Box, Grid, IconButton } from "@mui/material";
import { MaterialReactTable } from "material-react-table";
import http from "common/utils/httpClient";
import { find, isEmpty } from "lodash";
import { useTranslation } from "react-i18next";
import { mapObservations } from "common/subjectModelMapper";
import { Link } from "react-router-dom";
import { selectFormMappingForEncounter } from "../../sagas/encounterSelector";
import { selectFormMappingForProgramEncounter } from "../../sagas/programEncounterSelector";
import { connect } from "react-redux";
import { getEncounterForm } from "../../reducers/programSubjectDashboardReducer";
import Observations from "dataEntryApp/components/Observations";
import CustomizedBackdrop from "../../components/CustomizedBackdrop";
import { DeleteButton } from "../../components/DeleteButton";
import { formatDate } from "../../../common/utils/General";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

const useStyles = makeStyles(theme => ({
  editLabel: {
    textTransform: "uppercase",
    fontWeight: 500
  }
}));

const transformApiResponse = response => {
  response.observations = mapObservations(response.observations);
  response.cancelObservations = mapObservations(response.cancelObservations);
};

const EditVisitLink = ({ editEncounterUrl, encounter, isForProgramEncounters, encounterFormMapping, programEncounterFormMapping }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isFormAvailable = isForProgramEncounters ? programEncounterFormMapping : encounterFormMapping;

  return isFormAvailable ? (
    <Link to={`${editEncounterUrl}?uuid=${encounter.uuid}`} className={classes.editLabel}>
      {" "}
      {t("edit visit")}
    </Link>
  ) : (
    "-"
  );
};

const mapStateToProps = (state, props) => ({
  encounterFormMapping: selectFormMappingForEncounter(
    props.encounter.encounterType.uuid,
    state.dataEntry.subjectProfile.subjectProfile.subjectType.uuid
  )(state),
  programEncounterFormMapping:
    props.isForProgramEncounters &&
    selectFormMappingForProgramEncounter(
      props.encounter.encounterType.uuid,
      state.dataEntry.programEncounterReducer.programEnrolment.program.uuid,
      state.dataEntry.subjectProfile.subjectProfile.subjectType.uuid
    )(state),
  encounterForms: state.dataEntry.subjectProgram.encounterForms
});

const EditVisit = connect(mapStateToProps)(EditVisitLink);

const EncounterObs = ({
  encounter,
  isForProgramEncounters,
  encounterFormMapping,
  programEncounterFormMapping,
  encounterForms,
  getEncounterForm
}) => {
  const formMapping = isForProgramEncounters ? programEncounterFormMapping : encounterFormMapping;
  const formUUID = formMapping.formUUID;
  const requiredFormDetails = find(encounterForms, ef => ef.formUUID === formUUID);

  React.useEffect(() => {
    if (!requiredFormDetails) {
      getEncounterForm(formUUID);
    }
  }, [requiredFormDetails, formUUID, getEncounterForm]);

  return requiredFormDetails ? (
    <Observations
      observations={encounter.encounterDateTime ? encounter.observations : encounter.cancelObservations || []}
      form={requiredFormDetails.form}
      customKey={encounter.uuid}
      key={encounter.uuid}
    />
  ) : (
    <CustomizedBackdrop load={!isEmpty(requiredFormDetails)} />
  );
};

const mapDispatchToProps = {
  getEncounterForm
};

const EncounterObservations = connect(
  mapStateToProps,
  mapDispatchToProps
)(EncounterObs);

const CompletedVisitsTable = ({
  apiUrl,
  viewEncounterUrl,
  filterParams,
  entityUuid,
  editEncounterUrl,
  isForProgramEncounters,
  onDelete
}) => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([{ id: "encounterDateTime", desc: true }]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: t("visitName"),
        Cell: ({ row }) => t(row.original.name || row.original.encounterType.name)
      },
      {
        accessorKey: "encounterDateTime",
        header: t("visitcompleteddate"),
        Cell: ({ row }) => formatDate(row.original.encounterDateTime)
      },
      {
        accessorKey: "cancelDateTime",
        header: t("visitCanceldate"),
        Cell: ({ row }) => formatDate(row.original.cancelDateTime)
      },
      {
        accessorKey: "earliestVisitDateTime",
        header: t("visitscheduledate"),
        Cell: ({ row }) => formatDate(row.original.earliestVisitDateTime)
      },
      {
        id: "actions",
        header: t("actions"),
        enableSorting: false,
        Cell: ({ row }) => (
          <Grid container alignItems={"center"} alignContent={"center"} spacing={10}>
            <Grid item>
              <EditVisit
                editEncounterUrl={editEncounterUrl(row.original.cancelDateTime ? "cancel" : "")}
                encounter={row.original}
                isForProgramEncounters={isForProgramEncounters}
              />
            </Grid>
            <Grid item>
              <DeleteButton onDelete={() => onDelete(row.original)} />
            </Grid>
          </Grid>
        )
      }
    ],
    [t, editEncounterUrl, isForProgramEncounters, onDelete]
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { ...filterParams };
      params.page = pagination.pageIndex;
      params.size = pagination.pageSize;
      if (sorting[0]?.id) {
        params.sort = `${sorting[0].id},${sorting[0].desc ? "desc" : "asc"}`;
      } else {
        params.sort = null;
      }
      const filterQueryString = new URLSearchParams(params).toString();
      const result = await http.get(`${apiUrl}?${filterQueryString}`).then(response => response.data);
      result.content.forEach(e => transformApiResponse(e));
      setData(result.content || []);
      setTotalRecords(result.totalElements || 0);
    } catch (error) {
      console.error("Failed to fetch data", error);
      setData([]);
      setTotalRecords(0);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, filterParams, pagination, sorting]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <MaterialReactTable
      columns={columns}
      data={data}
      manualPagination
      manualSorting
      onPaginationChange={setPagination}
      onSortingChange={setSorting}
      rowCount={totalRecords}
      state={{ isLoading, pagination, sorting }}
      enableGlobalFilter={false}
      enableColumnFilters={false}
      enableTopToolbar={false}
      enableExpanding
      renderDetailPanel={({ row }) => (
        <Box margin={1} key={row.original.uuid}>
          <EncounterObservations encounter={row.original} isForProgramEncounters={isForProgramEncounters} />
        </Box>
      )}
      renderExpandIcon={({ row }) => <IconButton>{row.getIsExpanded() ? <KeyboardArrowUp /> : <KeyboardArrowDown />}</IconButton>}
      initialState={{
        sorting: [{ id: "encounterDateTime", desc: true }]
      }}
    />
  );
};

export default CompletedVisitsTable;
