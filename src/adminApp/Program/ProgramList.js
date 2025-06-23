import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import http from "common/utils/httpClient";
import _, { get, isEqual } from "lodash";
import { Redirect, withRouter } from "react-router-dom";
import Box from "@mui/material/Box";
import { Title } from "react-admin";
import { ShowSubjectType } from "../WorkFlow/ShowSubjectType";
import { findProgramEnrolmentForm, findProgramExitForm } from "../domain/formMapping";
import { CreateComponent } from "../../common/components/CreateComponent";
import AvniMaterialTable from "adminApp/components/AvniMaterialTable";
import UserInfo from "../../common/model/UserInfo";
import { Privilege } from "openchs-models";
import { connect } from "react-redux";
import { Edit, Delete } from "@mui/icons-material";

function hasEditPrivilege(userInfo) {
  return UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditProgram);
}

const ProgramList = ({ history, userInfo }) => {
  const [formMappings, setFormMappings] = useState([]);
  const [subjectType, setSubjectType] = useState([]);
  const [redirect, setRedirect] = useState(false);
  const tableRef = useRef(null);

  useEffect(() => {
    http.get("/web/operationalModules").then(response => {
      const formMap = response.data.formMappings;
      formMap.map(l => (l["isVoided"] = false));
      setFormMappings(formMap);
      setSubjectType(response.data.subjectTypes);
    });
  }, []);

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        enableSorting: true,
        Cell: ({ row }) => <a href={`#/appDesigner/program/${row.original.id}/show`}>{row.original.name}</a>
      },
      {
        accessorKey: "subjectType",
        header: "Subject Type",
        enableSorting: false,
        Cell: ({ row }) => (
          <ShowSubjectType
            rowDetails={row.original}
            subjectType={subjectType}
            formMapping={formMappings}
            setMapping={setFormMappings}
            entityUUID="programUUID"
          />
        )
      },
      {
        accessorKey: "enrolmentForm",
        header: "Enrolment Form",
        enableSorting: false,
        Cell: ({ row }) => (
          <a href={`#/appdesigner/forms/${get(findProgramEnrolmentForm(formMappings, row.original), "formUUID")}`}>
            {get(findProgramEnrolmentForm(formMappings, row.original), "formName")}
          </a>
        )
      },
      {
        accessorKey: "exitForm",
        header: "Exit Form",
        enableSorting: false,
        Cell: ({ row }) => (
          <a href={`#/appdesigner/forms/${get(findProgramExitForm(formMappings, row.original), "formUUID")}`}>
            {get(findProgramExitForm(formMappings, row.original), "formName")}
          </a>
        )
      },
      {
        accessorKey: "colour",
        header: "Colour",
        enableSorting: true,
        Cell: ({ row }) => <div style={{ width: "20px", height: "20px", border: "1px solid", background: row.original.colour }}>&nbsp;</div>
      }
    ],
    [formMappings, subjectType]
  );

  const fetchData = useCallback(
    ({ page, pageSize, orderBy, orderDirection }) =>
      new Promise(resolve => {
        const validSortFields = ["name", "colour"];
        let apiUrl = `/web/program?size=${encodeURIComponent(pageSize)}&page=${encodeURIComponent(page)}`;
        if (orderBy && validSortFields.includes(orderBy)) {
          apiUrl += `&sort=${encodeURIComponent(orderBy)},${encodeURIComponent(orderDirection)}`;
        }
        http
          .get(apiUrl)
          .then(response => response.data)
          .then(result => {
            resolve({
              data: result._embedded?.program || [],
              totalCount: result.page?.totalElements || 0
            });
          })
          .catch(error => {
            console.error("Failed to fetch programs:", error);
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
              tooltip: "Edit program",
              onClick: (event, row) => history.push(`/appDesigner/program/${row.original.id}`),
              disabled: row => row.original.voided ?? false
            },
            {
              icon: Delete,
              tooltip: "Delete program",
              onClick: (event, row) => {
                const voidedMessage = `Do you really want to delete the program ${row.original.name}?`;
                if (window.confirm(voidedMessage)) {
                  http
                    .delete(`/web/program/${row.original.id}`)
                    .then(response => {
                      if (response.status === 200 && tableRef.current) {
                        tableRef.current.refresh();
                      }
                    })
                    .catch(error => {
                      console.error("Failed to delete program:", error);
                      alert("Failed to delete program. Please try again.");
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
        <Title title="Programs" />
        <div className="container">
          <div>
            <div style={{ float: "right", right: "50px", marginTop: "15px" }}>
              {hasEditPrivilege(userInfo) && <CreateComponent onSubmit={() => setRedirect(true)} name="New Program" />}
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
              route={"/appdesigner/program"}
            />
          </div>
        </div>
      </Box>
      {redirect && <Redirect to={"/appDesigner/program/create"} />}
    </>
  );
};
function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}
const mapStateToProps = state => ({
  userInfo: state.app.userInfo
});
export default withRouter(connect(mapStateToProps)(React.memo(ProgramList, areEqual)));
