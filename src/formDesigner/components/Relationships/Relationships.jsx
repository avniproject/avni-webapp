import { memo, useEffect, useState, useRef, useMemo, useCallback } from "react";
import { httpClient as http } from "common/utils/httpClient";
import { get, isEqual } from "lodash";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import { Title } from "react-admin";
import { CreateComponent } from "../../../common/components/CreateComponent";
import AvniMaterialTable from "adminApp/components/AvniMaterialTable";
import { useSelector } from "react-redux";
import UserInfo from "../../../common/model/UserInfo";
import { Privilege } from "openchs-models";
import { Edit, Delete } from "@mui/icons-material";

function hasEditPrivilege(userInfo) {
  return UserInfo.hasPrivilege(
    userInfo,
    Privilege.PrivilegeType.EditSubjectType
  );
}

const Relationships = () => {
  const navigate = useNavigate();
  const userInfo = useSelector(state => state.app.userInfo);
  const [result, setResult] = useState([]);
  const [
    isIndividualSubjectTypeAvailable,
    setIsIndividualSubjectTypeAvailable
  ] = useState("");
  const tableRef = useRef(null);

  useEffect(() => {
    http
      .get("/web/subjectType")
      .then(response => {
        const subjectTypes = get(response, "data._embedded.subjectType", []);
        const flag = subjectTypes.some(
          subjectType => subjectType.type === "Person"
        )
          ? "true"
          : "false";
        setIsIndividualSubjectTypeAvailable(flag);
      })
      .catch(error => {
        console.error("Failed to fetch subject types:", error);
        setIsIndividualSubjectTypeAvailable("false");
      });

    http
      .get("/web/relation")
      .then(response => {
        console.log("Relationships fetchData response:", response.data); // Debug log
        setResult(
          (response.data || []).map(item => ({
            ...item,
            voided: item.voided ?? item.isVoided ?? false // Normalize voided
          }))
        );
      })
      .catch(error => {
        console.error("Failed to fetch relationships:", error);
        setResult([]);
      });
  }, []);

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        enableSorting: true,
        Cell: ({ row }) =>
          !row.original.voided ? (
            <a href={`#/appDesigner/relationship/${row.original.id}/show`}>
              {row.original.name}
            </a>
          ) : (
            <span>{row.original.name}</span>
          )
      },
      {
        accessorKey: "genders",
        header: "Genders",
        enableSorting: false,
        Cell: ({ row }) => {
          const genders =
            row.original.genders?.map(gender => gender.name) || [];
          return genders.join(", ") || "-";
        }
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
              icon: Edit,
              tooltip: "Edit relationship",
              onClick: (event, row) =>
                navigate(`/appDesigner/relationship/${row.original.id}`),
              disabled: row => row.original?.voided ?? false
            },
            {
              icon: Delete,
              tooltip: "Delete relationship",
              onClick: (event, row) => {
                const voidedMessage = `Do you really want to delete the relationship ${
                  row.original.name
                }?`;
                if (window.confirm(voidedMessage)) {
                  http
                    .delete(`/web/relation/${row.original.id}`)
                    .then(response => {
                      if (response.status === 200 && tableRef.current) {
                        tableRef.current.refresh();
                      }
                    })
                    .catch(error => {
                      console.error("Failed to delete relationship:", error);
                      alert("Failed to delete relationship. Please try again.");
                    });
                }
              },
              disabled: row => row.original?.voided ?? false
            }
          ]
        : [],
    [navigate, userInfo]
  );

  const handleCreateSubmit = useCallback(() => {
    navigate("/appDesigner/relationship/create");
  }, [navigate]);

  return (
    <Box
      sx={{
        boxShadow: 2,
        p: 3,
        bgcolor: "background.paper"
      }}
    >
      <Title title="Relationships" />
      <div className="container">
        {isIndividualSubjectTypeAvailable === "false" && (
          <div style={{ color: "red" }}>
            Please click <a href={`#/appDesigner/subjectType/create`}>here</a>{" "}
            and create a Person subject type to enable this screen.
          </div>
        )}
        {isIndividualSubjectTypeAvailable === "true" && (
          <div>
            {hasEditPrivilege(userInfo) && (
              <div style={{ float: "right", right: "50px", marginTop: "15px" }}>
                <CreateComponent
                  onSubmit={handleCreateSubmit}
                  name="New Relationship"
                />
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
                  backgroundColor:
                    original?.voided ?? false ? "#DBDBDB" : "#fff"
                })
              }}
              actions={actions}
              route={"/appdesigner/relationship"}
            />
          </div>
        )}
      </div>
    </Box>
  );
};

function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}

export default memo(Relationships, areEqual);
