import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { httpClient as http } from "common/utils/httpClient";
import { get } from "lodash";
import { useNavigate } from "react-router-dom";
import { Box, Grid } from "@mui/material";
import { Title } from "react-admin";
import { ShowPrograms, ShowSubjectType } from "../WorkFlow/ShowSubjectType";
import {
  findProgramEncounterForm,
  findProgramEncounterCancellationForm
} from "../domain/formMapping";
import { CreateComponent } from "../../common/components/CreateComponent";
import AvniMaterialTable from "adminApp/components/AvniMaterialTable";
import { useSelector } from "react-redux";
import UserInfo from "../../common/model/UserInfo";
import { Privilege } from "openchs-models";
import { Edit, Delete } from "@mui/icons-material";

function hasEditPrivilege(userInfo) {
  return UserInfo.hasPrivilege(
    userInfo,
    Privilege.PrivilegeType.EditEncounterType
  );
}

const EncounterTypeList = () => {
  const navigate = useNavigate();
  const userInfo = useSelector(state => state.app.userInfo);
  const [formMappings, setFormMappings] = useState([]);
  const [subjectTypes, setSubjectTypes] = useState([]);
  const [program, setProgram] = useState([]);
  const tableRef = useRef(null);

  useEffect(() => {
    http.get("/web/operationalModules").then(response => {
      const formMap = response.data.formMappings;
      formMap.map(l => (l["isVoided"] = false));
      setFormMappings(formMap);
      setSubjectTypes(response.data.subjectTypes);
      setProgram(response.data.programs);
    });
  }, []);

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        enableSorting: true,
        Cell: ({ row }) => (
          <a href={`#/appDesigner/encounterType/${row.original.id}/show`}>
            {row.original.name}
          </a>
        )
      },
      {
        accessorKey: "subjectType",
        header: "Subject Type",
        Cell: ({ row }) => (
          <ShowSubjectType
            rowDetails={row.original}
            subjectType={subjectTypes}
            formMapping={formMappings}
            setMapping={setFormMappings}
            entityUUID="encounterTypeUUID"
          />
        )
      },
      {
        accessorKey: "programs",
        header: "Programs",
        Cell: ({ row }) => (
          <ShowPrograms
            rowDetails={row.original}
            program={program}
            formMapping={formMappings}
            setMapping={setFormMappings}
          />
        )
      },
      {
        accessorKey: "encounterForm",
        header: "Encounter Form",
        Cell: ({ row }) => (
          <a
            href={`#/appdesigner/forms/${get(
              findProgramEncounterForm(formMappings, row.original),
              "formUUID"
            )}`}
          >
            {get(
              findProgramEncounterForm(formMappings, row.original),
              "formName"
            )}
          </a>
        )
      },
      {
        accessorKey: "cancellationForm",
        header: "Cancellation Form",
        Cell: ({ row }) => (
          <a
            href={`#/appdesigner/forms/${get(
              findProgramEncounterCancellationForm(formMappings, row.original),
              "formUUID"
            )}`}
          >
            {get(
              findProgramEncounterCancellationForm(formMappings, row.original),
              "formName"
            )}
          </a>
        )
      }
    ],
    [formMappings, subjectTypes, program]
  );

  const fetchData = useCallback(
    ({ page, pageSize, orderBy, orderDirection }) =>
      new Promise(resolve => {
        const validSortFields = ["name"];
        let apiUrl = `/web/encounterType?size=${encodeURIComponent(
          pageSize
        )}&page=${encodeURIComponent(page)}`;
        if (orderBy && validSortFields.includes(orderBy)) {
          apiUrl += `&sort=${encodeURIComponent(orderBy)},${encodeURIComponent(
            orderDirection
          )}`;
        }
        http
          .get(apiUrl)
          .then(response => response.data)
          .then(result => {
            resolve({
              data: result._embedded?.encounterType || [],
              totalCount: result.page?.totalElements || 0
            });
          })
          .catch(error => {
            console.error("Failed to fetch encounter types:", error);
            resolve({
              data: [],
              totalCount: 0
            });
          });
      }),
    []
  );

  const actions = useMemo(
    () =>
      hasEditPrivilege(userInfo)
        ? [
            {
              icon: Edit,
              tooltip: "Edit encounter type",
              onClick: (event, row) =>
                navigate(`/appDesigner/encounterType/${row.original.id}`),
              disabled: row => row.original.voided ?? false
            },
            {
              icon: Delete,
              tooltip: "Delete encounter type",
              onClick: (event, row) => {
                const voidedMessage = `Do you really want to delete the encounter type ${
                  row.original.name
                }?`;
                if (window.confirm(voidedMessage)) {
                  http
                    .delete(`/web/encounterType/${row.original.id}`)
                    .then(response => {
                      if (response.status === 200 && tableRef.current) {
                        tableRef.current.refresh();
                      }
                    })
                    .catch(error => {
                      console.error("Failed to delete encounter type:", error);
                      alert(
                        "Failed to delete encounter type. Please try again."
                      );
                    });
                }
              },
              disabled: row => row.original.voided ?? false
            }
          ]
        : [],
    [navigate, userInfo]
  );

  const handleCreateSubmit = () => {
    navigate("/appDesigner/encounterType/create");
  };

  return (
    <Box
      sx={{
        boxShadow: 2,
        p: 3,
        bgcolor: "background.paper",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <Title title="Encounter Types" />
      <Grid container sx={{ justifyContent: "flex-end", mb: 2 }}>
        {hasEditPrivilege(userInfo) && (
          <Grid>
            <CreateComponent
              onSubmit={handleCreateSubmit}
              name="New Encounter Type"
            />
          </Grid>
        )}
      </Grid>
      <AvniMaterialTable
        title=""
        ref={tableRef}
        columns={columns}
        fetchData={fetchData}
        options={{
          pageSize: 10,
          sorting: true,
          debounceInterval: 500,
          search: false,
          rowStyle: ({ original }) => ({
            backgroundColor: original.voided ? "#DBDBDB" : "#fff"
          })
        }}
        actions={actions}
        route="/appDesigner/encounterType"
      />
    </Box>
  );
};

export default EncounterTypeList;
