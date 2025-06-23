import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import http from "common/utils/httpClient";
import { get, isEqual } from "lodash";
import { Redirect, withRouter } from "react-router-dom";
import Box from "@mui/material/Box";
import { Title } from "react-admin";
import { CreateComponent } from "../../../common/components/CreateComponent";
import AvniMaterialTable from "adminApp/components/AvniMaterialTable";
import { connect } from "react-redux";
import UserInfo from "../../../common/model/UserInfo";
import { Privilege } from "openchs-models";
import { Delete } from "@mui/icons-material";

function hasEditPrivilege(userInfo) {
  return UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditSubjectType);
}

const RelationshipTypeList = ({ userInfo }) => {
  const [redirect, setRedirect] = useState(false);
  const [result, setResult] = useState([]);
  const [isIndividualSubjectTypeAvailable, setIsIndividualSubjectTypeAvailable] = useState("");
  const tableRef = useRef(null);

  useEffect(() => {
    http
      .get("/web/subjectType")
      .then(response => {
        const subjectTypes = get(response, "data._embedded.subjectType", []);
        const flag = subjectTypes.some(subjectType => subjectType.type === "Person") ? "true" : "false";
        setIsIndividualSubjectTypeAvailable(flag);
      })
      .catch(error => {
        console.error("Failed to fetch subject types:", error);
        setIsIndividualSubjectTypeAvailable("false");
      });

    http
      .get("/web/relationshipType")
      .then(response => {
        console.log("RelationshipTypeList fetchData response:", response.data); // Debug log
        setResult(
          (response.data || []).map(item => ({
            ...item,
            voided: item.voided ?? item.isVoided ?? false // Normalize voided
          }))
        );
      })
      .catch(error => {
        console.error("Failed to fetch relationship types:", error);
        setResult([]);
      });
  }, []);

  const columns = useMemo(
    () => [
      {
        accessorKey: "individualAIsToBRelation.name",
        header: "Relationship",
        enableSorting: true,
        Cell: ({ row }) => <span>{row.original.individualAIsToBRelation?.name || "-"}</span>
      },
      {
        accessorKey: "individualBIsToARelation.name",
        header: "Reverse Relationship",
        enableSorting: true,
        Cell: ({ row }) => <span>{row.original.individualBIsToARelation?.name || "-"}</span>
      }
    ],
    []
  );

  const fetchData = useCallback(
    ({ page, pageSize, orderBy, orderDirection }) =>
      new Promise(resolve => {
        let sortedData = [...result];
        if (orderBy) {
          sortedData.sort((a, b) => {
            const aValue = get(a, orderBy, "");
            const bValue = get(b, orderBy, "");
            const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            return orderDirection === "asc" ? comparison : -comparison;
          });
        }
        const start = page * pageSize;
        const paginatedData = sortedData.slice(start, start + pageSize);
        resolve({
          data: paginatedData,
          totalCount: sortedData.length
        });
      }),
    [result]
  );

  const actions = useMemo(
    () =>
      hasEditPrivilege(userInfo)
        ? [
            {
              icon: Delete,
              tooltip: "Delete relationship",
              onClick: (event, row) => {
                const voidedMessage = `Do you really want to delete the relationship type ${row.original.individualAIsToBRelation?.name ||
                  ""}?`;
                if (window.confirm(voidedMessage)) {
                  http
                    .delete(`/web/relationshipType/${row.original.id}`)
                    .then(response => {
                      if (response.status === 200 && tableRef.current) {
                        tableRef.current.refresh();
                      }
                    })
                    .catch(error => {
                      console.error("Failed to delete relationship type:", error);
                      alert("Failed to delete relationship type. Please try again.");
                    });
                }
              },
              disabled: row => row.original?.voided ?? false
            }
          ]
        : [],
    [userInfo]
  );

  const addNewConcept = useCallback(() => {
    setRedirect(true);
  }, []);

  return (
    <>
      <Box
        sx={{
          boxShadow: 2,
          p: 3,
          bgcolor: "background.paper"
        }}
      >
        <Title title="Relationship Types" />
        <div className="container">
          {isIndividualSubjectTypeAvailable === "false" && (
            <div style={{ color: "red", fontSize: 10 }}>
              Please click <a href={`#/appDesigner/subjectType/create`}>here</a> and create a Person subject type to enable this screen.
            </div>
          )}
          {isIndividualSubjectTypeAvailable === "true" && (
            <div>
              {hasEditPrivilege(userInfo) && (
                <div style={{ float: "right", right: "50px", marginTop: "15px" }}>
                  <CreateComponent onSubmit={addNewConcept} name="New Relationship type" />
                </div>
              )}
              <AvniMaterialTable
                title=""
                ref={tableRef}
                columns={columns}
                fetchData={fetchData}
                options={{
                  pageSize: 10,
                  pageSizeOptions: [10, 15, 20],
                  sorting: true,
                  debounceInterval: 500,
                  search: false,
                  rowStyle: ({ original }) => ({
                    backgroundColor: original?.voided ?? false ? "#DBDBDB" : "#fff"
                  })
                }}
                actions={actions}
                route={"/appdesigner/relationshipType"}
              />
            </div>
          )}
        </div>
      </Box>
      {redirect && <Redirect to={"/appDesigner/relationshipType/create"} />}
    </>
  );
};
function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}
const mapStateToProps = state => ({
  userInfo: state.app.userInfo
});
export default withRouter(connect(mapStateToProps)(React.memo(RelationshipTypeList, areEqual)));
