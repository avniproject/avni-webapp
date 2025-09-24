import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { styled } from "@mui/material/styles";
import { Box, Grid, IconButton } from "@mui/material";
import { MaterialReactTable } from "material-react-table";
import { MRTPagination } from "../../../adminApp/Util/MRTPagination.tsx";
import { useMRTPagination } from "../../../common/hooks/useMRTPagination";
import { httpClient as deaHttpClient } from "common/utils/httpClient";
import { find, isEmpty } from "lodash";

// Create scoped client for DataEntryApp with graceful error handling
const http = deaHttpClient.createScopedClientForDEA();
import { useTranslation } from "react-i18next";
import { mapObservations } from "common/subjectModelMapper";
import { Link } from "react-router-dom";
import { selectFormMappingForEncounter } from "../../sagas/encounterSelector";
import { selectFormMappingForProgramEncounter } from "../../sagas/programEncounterSelector";
import { getEncounterForm } from "../../reducers/programSubjectDashboardReducer";
import Observations from "dataEntryApp/components/Observations";
import CustomizedBackdrop from "../../components/CustomizedBackdrop";
import { DeleteButton } from "../../components/DeleteButton";
import { formatDate } from "../../../common/utils/General";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

const StyledLink = styled(Link)({
  textTransform: "uppercase",
  fontWeight: 500,
});

const StyledGrid = styled(Grid)({
  alignItems: "center",
  alignContent: "center",
});

const StyledBox = styled(Box)(({ theme }) => ({
  margin: theme.spacing(1),
}));

const transformApiResponse = (response) => {
  response.observations = mapObservations(response.observations);
  response.cancelObservations = mapObservations(response.cancelObservations);
};

const EditVisitLink = ({
  editEncounterUrl,
  encounter,
  isForProgramEncounters,
}) => {
  const { t } = useTranslation();

  const encounterFormMapping = useSelector((state) =>
    selectFormMappingForEncounter(
      encounter.encounterType.uuid,
      state.dataEntry.subjectProfile.subjectProfile.subjectType.uuid,
    )(state),
  );

  const programEncounterFormMapping = useSelector(
    (state) =>
      isForProgramEncounters &&
      selectFormMappingForProgramEncounter(
        encounter.encounterType.uuid,
        state.dataEntry.programEncounterReducer.programEnrolment.program.uuid,
        state.dataEntry.subjectProfile.subjectProfile.subjectType.uuid,
      )(state),
  );

  const isFormAvailable = isForProgramEncounters
    ? programEncounterFormMapping
    : encounterFormMapping;

  return isFormAvailable ? (
    <StyledLink to={`${editEncounterUrl}?uuid=${encounter.uuid}`}>
      {t("edit visit")}
    </StyledLink>
  ) : (
    "-"
  );
};

const EncounterObs = ({ encounter, isForProgramEncounters }) => {
  const dispatch = useDispatch();

  const encounterFormMapping = useSelector((state) =>
    selectFormMappingForEncounter(
      encounter.encounterType.uuid,
      state.dataEntry.subjectProfile.subjectProfile.subjectType.uuid,
    )(state),
  );

  const programEncounterFormMapping = useSelector(
    (state) =>
      isForProgramEncounters &&
      selectFormMappingForProgramEncounter(
        encounter.encounterType.uuid,
        state.dataEntry.programEncounterReducer.programEnrolment.program.uuid,
        state.dataEntry.subjectProfile.subjectProfile.subjectType.uuid,
      )(state),
  );

  const encounterForms = useSelector(
    (state) => state.dataEntry.subjectProgram.encounterForms,
  );

  const formMapping = isForProgramEncounters
    ? programEncounterFormMapping
    : encounterFormMapping;
  const formUUID = formMapping.formUUID;
  const requiredFormDetails = find(
    encounterForms,
    (ef) => ef.formUUID === formUUID,
  );

  useEffect(() => {
    if (!requiredFormDetails) {
      dispatch(getEncounterForm(formUUID));
    }
  }, [requiredFormDetails, formUUID, dispatch]);

  return requiredFormDetails ? (
    <Observations
      observations={
        encounter.encounterDateTime
          ? encounter.observations
          : encounter.cancelObservations || []
      }
      form={requiredFormDetails.form}
      customKey={encounter.uuid}
      key={encounter.uuid}
    />
  ) : (
    <CustomizedBackdrop load={!isEmpty(requiredFormDetails)} />
  );
};

const CompletedVisitsTable = ({
  apiUrl,
  filterParams,
  editEncounterUrl,
  isForProgramEncounters,
  onDelete,
}) => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([
    { id: "encounterDateTime", desc: true },
  ]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: t("visitName"),
        Cell: ({ row }) =>
          t(row.original.name || row.original.encounterType.name),
      },
      {
        accessorKey: "encounterDateTime",
        header: t("visitcompleteddate"),
        Cell: ({ row }) => formatDate(row.original.encounterDateTime),
      },
      {
        accessorKey: "cancelDateTime",
        header: t("visitCanceldate"),
        Cell: ({ row }) => formatDate(row.original.cancelDateTime),
      },
      {
        accessorKey: "earliestVisitDateTime",
        header: t("visitscheduledate"),
        Cell: ({ row }) => formatDate(row.original.earliestVisitDateTime),
      },
      {
        id: "actions",
        header: t("actions"),
        enableSorting: false,
        Cell: ({ row }) => (
          <StyledGrid container spacing={10}>
            <Grid>
              <EditVisitLink
                editEncounterUrl={editEncounterUrl(
                  row.original.cancelDateTime ? "cancel" : "",
                )}
                encounter={row.original}
                isForProgramEncounters={isForProgramEncounters}
              />
            </Grid>
            <Grid>
              <DeleteButton onDelete={() => onDelete(row.original)} />
            </Grid>
          </StyledGrid>
        ),
      },
    ],
    [t, editEncounterUrl, isForProgramEncounters, onDelete],
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
      const result = await http
        .get(`${apiUrl}?${filterQueryString}`)
        .then((response) => response.data);
      result.content.forEach((e) => transformApiResponse(e));
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

  const paginationProps = useMRTPagination({
    pagination,
    setPagination,
    totalRecords,
    isLoading,
  });

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
        <StyledBox key={row.original.uuid}>
          <EncounterObs
            encounter={row.original}
            isForProgramEncounters={isForProgramEncounters}
          />
        </StyledBox>
      )}
      renderExpandIcon={({ row }) => (
        <IconButton>
          {row.getIsExpanded() ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
        </IconButton>
      )}
      renderBottomToolbar={() => <MRTPagination {...paginationProps} />}
      initialState={{
        sorting: [{ id: "encounterDateTime", desc: true }],
      }}
    />
  );
};

export default CompletedVisitsTable;
