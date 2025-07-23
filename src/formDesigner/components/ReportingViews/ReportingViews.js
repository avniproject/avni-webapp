import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { useSelector } from "react-redux";
import { Title } from "react-admin";
import { httpClient as http } from "../../../common/utils/httpClient";
import { get } from "lodash";
import { CreateComponent } from "../../../common/components/CreateComponent";
import Modal from "@mui/material/Modal";
import CircularProgress from "@mui/material/CircularProgress";
import CustomizedSnackbar from "../CustomizedSnackbar";
import { DocumentationContainer } from "../../../common/components/DocumentationContainer";
import Chip from "@mui/material/Chip";
import { JSEditor } from "../../../common/components/JSEditor";
import AvniMaterialTable from "adminApp/components/AvniMaterialTable";
import UserInfo from "../../../common/model/UserInfo";
import { Privilege } from "openchs-models";
import MuiComponentHelper from "../../../common/utils/MuiComponentHelper";
import { Delete } from "@mui/icons-material";
import { Grid } from "@mui/material";

const StyledBox = styled(Box)(({ theme }) => ({
  boxShadow: theme.shadows[2],
  padding: theme.spacing(5),
  backgroundColor: theme.palette.background.paper,
  display: "flex",
  flexDirection: "column"
}));

const StyledDetailPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2)
}));

const StyledChip = styled(Chip)({
  color: "#FFF",
  backgroundColor: "#f50057",
  height: 20,
  display: "inline-block",
  marginLeft: "10px",
  marginBottom: "10px"
});

const StyledCircularProgress = styled(CircularProgress)({
  position: "absolute",
  top: "30%",
  left: "50%",
  zIndex: 1
});

function hasEditPrivilege(userInfo) {
  return UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.Report);
}

const ReportingViews = () => {
  const tableRef = useRef(null);
  const userInfo = useSelector(state => state.app.userInfo);
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState();

  useEffect(() => {
    http
      .get("/viewsInDb")
      .then(response => {
        console.log("ReportingViews fetchData response:", response.data);
        setResult(
          (response.data || []).map(view => ({
            ...view,
            legacyView: view.legacyView ?? false
          }))
        );
      })
      .catch(error => {
        console.error("Failed to fetch views:", error);
        setResult([]);
      });
  }, []);

  const renderWarning = useCallback(
    (viewName, isLegacy) => (
      <span>
        {viewName}
        {isLegacy && <StyledChip label="Deprecated - Do not use" />}
      </span>
    ),
    []
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: "viewName",
        header: "View Name",
        enableSorting: true,
        Cell: ({ row }) => renderWarning(row.original.viewName, row.original.legacyView)
      }
    ],
    [renderWarning]
  );

  const fetchData = useCallback(
    ({ page, pageSize, orderBy, orderDirection, globalFilter }) =>
      new Promise(resolve => {
        let filteredData = [...result];
        if (globalFilter) {
          filteredData = filteredData.filter(view => view.viewName.toLowerCase().includes(globalFilter.toLowerCase()));
        }
        if (orderBy) {
          filteredData.sort((a, b) => {
            const aValue = get(a, orderBy, "");
            const bValue = get(b, orderBy, "");
            const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            return orderDirection === "asc" ? comparison : -comparison;
          });
        }
        const start = page * pageSize;
        const paginatedData = filteredData.slice(start, start + pageSize);
        resolve({
          data: paginatedData,
          totalCount: filteredData.length
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
              tooltip: "Delete View",
              disabled: row => row.original.legacyView,
              onClick: (event, row) => {
                const voidedMessage = `Do you really want to delete view ${row.original.viewName}?`;
                if (window.confirm(voidedMessage)) {
                  http
                    .delete(`/reportingView/${row.original.viewName}`)
                    .then(response => {
                      if (response.status === 200 && tableRef.current) {
                        tableRef.current.refresh();
                      }
                    })
                    .catch(error => {
                      console.error("Failed to delete view:", error);
                      alert("Failed to delete view. Please try again.");
                    });
                }
              }
            }
          ]
        : [],
    [userInfo]
  );

  const confirmViewCreation = useCallback(() => {
    if (window.confirm("Are you sure you want to proceed with view creation/refresh?")) {
      setLoading(true);
      http
        .post("/createReportingViews")
        .then(res => {
          if (res.status === 200) {
            setResult(
              (res.data || []).map(view => ({
                ...view,
                legacyView: view.legacyView ?? false
              }))
            );
            setLoading(false);
            setMessage("Successfully created the views");
            setShowAlert(true);
          }
        })
        .catch(error => {
          setLoading(false);
          const errorMessage = `${get(error, "response.data") || get(error, "message") || "unknown error"}`;
          alert(errorMessage);
        });
    }
  }, []);

  return (
    <StyledBox>
      <Title title="Reporting Views" />
      <DocumentationContainer filename="View.md">
        <Grid container sx={{ justifyContent: "flex-end", mb: 2 }}>
          {hasEditPrivilege(userInfo) && (
            <Grid>
              <CreateComponent onSubmit={confirmViewCreation} name="Create/Refresh view" />
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
            pageSizeOptions: [10, 15, 20],
            sorting: true,
            debounceInterval: 500,
            search: true,
            rowStyle: ({ original }) => ({
              backgroundColor: original.legacyView ? "#DBDBDB" : "#FFF"
            })
          }}
          renderDetailPanel={({ row }) => (
            <StyledDetailPanel>
              <JSEditor readOnly value={row.original.viewDefinition} />
            </StyledDetailPanel>
          )}
          actions={actions}
          route="/appdesigner/reportingViews"
        />
        <Modal onClose={MuiComponentHelper.getDialogClosingHandler()} open={loading}>
          <StyledCircularProgress size={150} />
        </Modal>
        {showAlert && <CustomizedSnackbar message={message} getDefaultSnackbarStatus={setShowAlert} defaultSnackbarStatus={showAlert} />}
      </DocumentationContainer>
    </StyledBox>
  );
};

export default ReportingViews;
