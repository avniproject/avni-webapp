import { memo, useState, useRef, useMemo, useCallback, useEffect } from "react";
import { httpClient as http } from "common/utils/httpClient";
import { get, isEqual } from "lodash";
import { useNavigate } from "react-router-dom";
import { Box, Grid } from "@mui/material";
import { Title } from "react-admin";
import { findRegistrationForm } from "../domain/formMapping";
import { useFormMappings } from "./effects";
import { CreateComponent } from "../../common/components/CreateComponent";
import AvniMaterialTable from "adminApp/components/AvniMaterialTable";
import { useSelector } from "react-redux";
import UserInfo from "../../common/model/UserInfo";
import { Privilege } from "openchs-models";
import { Edit, Delete } from "@mui/icons-material";

function hasEditPrivilege(userInfo) {
  return UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditSubjectType);
}

const SubjectTypesList = () => {
  const navigate = useNavigate();
  const userInfo = useSelector(state => state.app.userInfo);
  const [formMappings, setFormMappings] = useState([]);
  const [redirect, setRedirect] = useState(false);
  const tableRef = useRef(null);

  useFormMappings(setFormMappings);

  useEffect(() => {
    if (redirect) {
      navigate("/appdesigner/subjectType/create");
    }
  }, [redirect, navigate]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        Cell: ({ row }) => <a href={`#/appdesigner/subjectType/${row.original.id}/show`}>{row.original.name}</a>
      },
      {
        accessorKey: "formName",
        header: "Registration Form",
        Cell: ({ row }) => {
          const formName = get(findRegistrationForm(formMappings, row.original), "formName");
          return hasEditPrivilege(userInfo) ? (
            <a href={`#/appdesigner/forms/${get(findRegistrationForm(formMappings, row.original), "formUUID")}`}>{formName}</a>
          ) : (
            formName
          );
        }
      },
      {
        accessorKey: "type",
        header: "Type"
      },
      {
        accessorKey: "organisationId",
        header: "Organization Id",
        type: "number"
      }
    ],
    [formMappings, userInfo]
  );

  const fetchData = useCallback(
    ({ page, pageSize, orderBy, orderDirection }) =>
      new Promise(resolve => {
        const validSortFields = ["name", "type", "organisationId"];
        let apiUrl = `/web/subjectType?size=${encodeURIComponent(pageSize)}&page=${encodeURIComponent(page)}`;
        if (orderBy && validSortFields.includes(orderBy)) {
          const sortBy = orderBy === "type" ? "subjectTypeType" : orderBy;
          apiUrl += `&sort=${encodeURIComponent(sortBy)},${encodeURIComponent(orderDirection)}`;
        }
        http
          .get(apiUrl)
          .then(response => response.data)
          .then(result => {
            resolve({
              data: result._embedded?.subjectType || [],
              totalCount: result.page?.totalElements || 0
            });
          })
          .catch(error => {
            console.error("Failed to fetch subject types:", error);
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
              tooltip: "Edit Subject Type",
              onClick: (event, row) => {
                navigate(`/appdesigner/subjectType/${row.original.id}`);
              },
              disabled: row => row.original.voided ?? false
            },
            {
              icon: Delete,
              tooltip: "Delete Subject Type",
              onClick: (event, row) => {
                const voidedMessage = `Do you really want to delete the subject type ${row.original.name}?`;
                if (window.confirm(voidedMessage)) {
                  http
                    .delete(`/web/subjectType/${row.original.id}`)
                    .then(response => {
                      if (response.status === 200 && tableRef.current) {
                        tableRef.current.refresh();
                      }
                    })
                    .catch(error => {
                      console.error("Failed to delete subject type:", error);
                      alert("Failed to delete subject type. Please try again.");
                    });
                }
              },
              disabled: row => row.original.voided ?? false
            }
          ]
        : [],
    [navigate, userInfo, tableRef]
  );

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
      <Title title="Subject Types" color="primary" />
      <Grid container sx={{ justifyContent: "flex-end", mb: 2 }}>
        {hasEditPrivilege(userInfo) && (
          <Grid>
            <CreateComponent onSubmit={() => setRedirect(true)} name="New Subject Type" />
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
            backgroundColor: original.active ? "#fff" : "#DBDBDB"
          })
        }}
        route="/appdesigner/subjectType"
        actions={actions}
      />
      {redirect && <div />}
    </Box>
  );
};

function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}

export default memo(SubjectTypesList, areEqual);
