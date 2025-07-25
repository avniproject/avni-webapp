import { useState, useEffect, useCallback, useMemo } from "react";
import { MaterialReactTable } from "material-react-table";
import { httpClient as http } from "common/utils/httpClient";
import { Box, Chip, Grid } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  filter,
  find,
  flatten,
  get,
  head,
  isEmpty,
  isNil,
  join,
  map,
  reject,
  size,
  uniqBy
} from "lodash";
import { extensionScopeTypes } from "../../../formDesigner/components/Extensions/ExtensionReducer";
import { ExtensionOption } from "../subjectDashBoard/components/extension/ExtensionOption";
import { AgeUtil } from "openchs-models";
import { useSelector } from "react-redux";
import { selectSubjectTypes } from "../../reducers/metadataReducer";
import SubjectProfilePicture from "../../components/SubjectProfilePicture";

const SubjectSearchTable = ({ searchRequest, organisationConfigs }) => {
  const { i18n, t } = useTranslation();
  const subjectTypes = useSelector(selectSubjectTypes);
  const [extensions, setExtensions] = useState();
  const customSearchFields = get(
    organisationConfigs,
    "organisationConfig.searchResultFields",
    []
  );
  const subjectType = find(
    subjectTypes,
    ({ uuid }) => uuid === get(searchRequest, "subjectType")
  );
  const isPerson = get(subjectType, "type", "Person") === "Person";

  useEffect(() => {
    setExtensions(
      get(organisationConfigs, "organisationConfig.extensions", [])
    );
  }, [organisationConfigs]);

  const getResultConcepts = customSearchFields =>
    map(customSearchFields, ({ searchResultConcepts }) => searchResultConcepts);

  const customColumns = useMemo(() => {
    return isEmpty(subjectType)
      ? getResultConcepts(customSearchFields)
      : getResultConcepts(
          filter(
            customSearchFields,
            ({ subjectTypeUUID }) => subjectTypeUUID === subjectType.uuid
          )
        );
  }, [subjectType, customSearchFields]);

  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});

  const columns = useMemo(
    () => [
      {
        accessorKey: "fullName",
        header: t("name"),
        Cell: ({ row }) => (
          <Grid
            container
            spacing={1}
            direction={"row"}
            sx={{
              alignItems: "center"
            }}
          >
            <Grid>
              <SubjectProfilePicture
                allowEnlargementOnClick={true}
                firstName={row.original.firstName}
                profilePicture={row.original.profilePicture}
                subjectType={null}
                subjectTypeName={row.original.subjectTypeName}
                size={20}
                style={{ margin: "0px" }}
              />
            </Grid>
            <Grid>
              <div>
                <a href={`/#/app/subject?uuid=${row.original.uuid}`}>
                  {row.original.fullName}
                </a>
              </div>
            </Grid>
          </Grid>
        )
      },
      ...flatten(customColumns).map(({ name }) => ({
        accessorKey: name,
        header: t(name),
        enableSorting: false
      })),
      ...(isEmpty(subjectType) && size(subjectTypes) > 1
        ? [
            {
              accessorKey: "subjectType",
              header: t("subjectType"),
              Cell: ({ row }) =>
                row.original.subjectTypeName && t(row.original.subjectTypeName)
            }
          ]
        : []),
      ...(isPerson
        ? [
            {
              accessorKey: "gender",
              header: t("gender"),
              Cell: ({ row }) => row.original.gender && t(row.original.gender)
            },
            {
              accessorKey: "dateOfBirth",
              header: t("age"),
              Cell: ({ row }) =>
                row.original.dateOfBirth
                  ? AgeUtil.getDisplayAge(row.original.dateOfBirth, i18n)
                  : ""
            }
          ]
        : []),
      {
        accessorKey: "addressLevel",
        header: t("Address"),
        enableSorting: false,
        Cell: ({ row }) => row.original.addressLevel
      },
      {
        id: "enrolments",
        header: t("enrolments"),
        enableSorting: false,
        Cell: ({ row }) => {
          const enrolments = row.original.enrolments;
          return enrolments
            ? uniqBy(enrolments, enr => enr.operationalProgramName).map(
                (p, key) => (
                  <Chip
                    key={key}
                    size="small"
                    label={t(p.operationalProgramName)}
                    style={{
                      margin: 2,
                      backgroundColor: p.programColor,
                      color: "white"
                    }}
                  />
                )
              )
            : null;
        }
      }
    ],
    [customColumns, subjectType, subjectTypes, isPerson, t, i18n]
  );
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const firstSubjectTypeUUID = get(head(subjectTypes), "uuid");

      // Create a copy of searchRequest to avoid mutation
      const requestCopy = { ...searchRequest };

      if (isNil(searchRequest.subjectType) && !isNil(firstSubjectTypeUUID)) {
        requestCopy.subjectType = firstSubjectTypeUUID;
      }

      const pageElement = {
        pageNumber: pagination.pageIndex,
        numberOfRecordPerPage: pagination.pageSize,
        sortColumn: sorting[0]?.id || null,
        sortOrder: sorting[0]?.desc ? "desc" : sorting[0]?.id ? "asc" : null
      };

      requestCopy.pageElement = pageElement;
      const result = await http
        .post("/web/searchAPI/v2", requestCopy)
        .then(res => res.data);
      setData(result.listOfRecords || []);
      setTotalRecords(result.totalElements || 0);
    } catch (error) {
      console.error("Failed to fetch data", error);
      setData([]);
      setTotalRecords(0);
    } finally {
      setIsLoading(false);
    }
  }, [pagination, sorting, searchRequest, subjectTypes]);
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
      state={{ isLoading, pagination, sorting, rowSelection }}
      onRowSelectionChange={setRowSelection}
      enableGlobalFilter={false}
      enableColumnFilters={false}
      renderTopToolbarCustomActions={({ table }) => (
        <Box sx={{ display: "flex", gap: "8px" }}>
          <ExtensionOption
            subjectUUIDs={join(
              map(table.getSelectedRowModel().rows, row => row.original.uuid),
              ","
            )}
            scopeType={extensionScopeTypes.searchResults}
            configExtensions={extensions}
          />
        </Box>
      )}
    />
  );
};
export default SubjectSearchTable;
