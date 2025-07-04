import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { httpClient as http } from "common/utils/httpClient";
import _, { get } from "lodash";
import { Redirect, withRouter } from "react-router-dom";
import Box from "@mui/material/Box";
import { Title } from "react-admin";
import { ShowPrograms, ShowSubjectType } from "../WorkFlow/ShowSubjectType";
import { findProgramEncounterForm, findProgramEncounterCancellationForm } from "../domain/formMapping";
import { CreateComponent } from "../../common/components/CreateComponent";
import AvniMaterialTable from "adminApp/components/AvniMaterialTable";
import { connect } from "react-redux";
import UserInfo from "../../common/model/UserInfo";
import { Privilege } from "openchs-models";
import { Edit, Delete } from "@mui/icons-material";

function hasEditPrivilege(userInfo) {
  return UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditEncounterType);
}

const EncounterTypeList = ({ history, userInfo }) => {
  const [redirect, setRedirect] = useState(false);
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
        Cell: ({ row }) => <a href={`#/appDesigner/encounterType/${row.original.id}/show`}>{row.original.name}</a>
      },
      {
        accessorKey: "subjectType",
        header: "Subject Type",
        enableSorting: false,
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
        enableSorting: false,
        Cell: ({ row }) => (
          <ShowPrograms rowDetails={row.original} program={program} formMapping={formMappings} setMapping={setFormMappings} />
        )
      },
      {
        accessorKey: "encounterForm",
        header: "Encounter Form",
        enableSorting: false,
        Cell: ({ row }) => (
          <a href={`#/appdesigner/forms/${get(findProgramEncounterForm(formMappings, row.original), "formUUID")}`}>
            {get(findProgramEncounterForm(formMappings, row.original), "formName")}
          </a>
        )
      },
      {
        accessorKey: "cancellationForm",
        header: "Cancellation Form",
        enableSorting: false,
        Cell: ({ row }) => (
          <a href={`#/appdesigner/forms/${get(findProgramEncounterCancellationForm(formMappings, row.original), "formUUID")}`}>
            {get(findProgramEncounterCancellationForm(formMappings, row.original), "formName")}
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
        let apiUrl = `/web/encounterType?size=${encodeURIComponent(pageSize)}&page=${encodeURIComponent(page)}`;
        if (orderBy && validSortFields.includes(orderBy)) {
          apiUrl += `&sort=${encodeURIComponent(orderBy)},${encodeURIComponent(orderDirection)}`;
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
              onClick: (event, row) => history.push(`/appDesigner/encounterType/${row.original.id}`),
              disabled: row => row.original.voided ?? false
            },
            {
              icon: Delete,
              tooltip: "Delete encounter type",
              onClick: (event, row) => {
                const voidedMessage = `Do you really want to delete the encounter type ${row.original.name}?`;
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
                      alert("Failed to delete encounter type. Please try again.");
                    });
                }
              },
              disabled: row => row.original.voided ?? false
            }
          ]
        : [],
    [history, userInfo]
  );

  return (
    <>
      <Box
        sx={{
          boxShadow: 2,
          p: 3,
          bgcolor: "background.paper"
        }}
      >
        <Title title="Encounter Types" />
        <div className="container">
          <div>
            <div style={{ float: "right", right: "50px", marginTop: "15px" }}>
              {hasEditPrivilege(userInfo) && <CreateComponent onSubmit={() => setRedirect(true)} name="New Encounter type" />}
            </div>
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
              route={"/appDesigner/encounterType"}
            />
          </div>
        </div>
      </Box>
      {redirect && <Redirect to={"/appDesigner/encounterType/create"} />}
    </>
  );
};
const mapStateToProps = state => ({
  userInfo: state.app.userInfo
});
export default withRouter(connect(mapStateToProps)(EncounterTypeList));
