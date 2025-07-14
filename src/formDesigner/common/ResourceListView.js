import { memo, useState, useRef, useMemo, useCallback, useEffect } from "react";
import { isEqual } from "lodash";
import { Redirect, withRouter } from "react-router-dom";
import Box from "@mui/material/Box";
import { CreateComponent } from "../../common/components/CreateComponent";
import { Title } from "react-admin";
import { httpClient as http } from "common/utils/httpClient";
import AvniMaterialTable from "adminApp/components/AvniMaterialTable";
import UserInfo from "../../common/model/UserInfo";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/DeleteOutline";
import { LinearProgress, Grid } from "@mui/material";

const ResourceListView = ({ history, title, resourceName, resourceURLName, columns, userInfo, editPrivilegeType }) => {
  const [redirect, setRedirect] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const tableRef = useRef(null);

  const fetchData = useCallback(
    async ({ page, pageSize, orderBy, orderDirection }) => {
      console.log(`[ResourceListView:${resourceName}] fetchData called`, { page, pageSize, orderBy, orderDirection });
      try {
        const response = await http.get(`/web/${resourceName}`);
        let data = Array.isArray(response.data) ? response.data : [];

        // Filter out voided entries
        data = data.filter(item => !item.voided);

        // Apply sorting if requested
        if (orderBy) {
          data = [...data].sort((a, b) => {
            const aValue = a[orderBy] ?? "";
            const bValue = b[orderBy] ?? "";
            const isNumeric = !isNaN(aValue) && !isNaN(bValue);
            if (isNumeric) {
              const comparison = Number(aValue) - Number(bValue);
              return orderDirection === "asc" ? comparison : -comparison;
            }
            const comparison = String(aValue).localeCompare(String(bValue));
            return orderDirection === "asc" ? comparison : -comparison;
          });
        }

        // Apply client-side pagination
        const start = page * pageSize;
        const paginatedData = data.slice(start, start + pageSize);

        return {
          data: paginatedData,
          totalCount: data.length
        };
      } catch (error) {
        console.error(`[ResourceListView:${resourceName}] HTTP error`, {
          error: error.message,
          response: error.response
        });
        return {
          data: [],
          totalCount: 0
        };
      }
    },
    [resourceName]
  );

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetchData({ page: 0, pageSize: 10 })
      .then(result => {
        if (isMounted) {
          setData(result.data);
          setTotalCount(result.totalCount);
          setIsLoading(false);
        }
      })
      .catch(error => {
        if (isMounted) {
          console.error(`[ResourceListView:${resourceName}] Initial fetch failed`, error);
          setData([]);
          setTotalCount(0);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [fetchData, resourceName]);

  const actions = useMemo(
    () =>
      UserInfo.hasPrivilege(userInfo, editPrivilegeType)
        ? [
            {
              icon: Edit,
              tooltip: `Edit ${title}`,
              onClick: (event, row) => history.push(`/appDesigner/${resourceURLName}/${row.original.id}`),
              disabled: row => row.original.voided ?? false
            },
            {
              icon: Delete,
              tooltip: `Delete ${title}`,
              onClick: (event, row) => {
                const voidedMessage = `Do you really want to delete ${title} ${row.original.name}?`;
                if (window.confirm(voidedMessage)) {
                  http
                    .delete(`/web/${resourceName}/${row.original.id}`)
                    .then(response => {
                      if (response.status === 200 && tableRef.current) {
                        tableRef.current.refresh();
                      }
                    })
                    .catch(error => {
                      console.error(`[DELETE:${resourceName}/${row.original.id}] Failed to delete`, error);
                      alert(`Failed to delete ${title}. Please try again.`);
                    });
                }
              },
              disabled: row => row.original.voided ?? false
            }
          ]
        : [],
    [history, userInfo, editPrivilegeType, resourceName, resourceURLName, title]
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
      <Title title={title} color="primary" />
      <Grid container sx={{ justifyContent: "flex-end", mb: 2 }}>
        {!isLoading && UserInfo.hasPrivilege(userInfo, editPrivilegeType) && (
          <Grid item>
            <CreateComponent onSubmit={() => setRedirect(true)} name={`New ${title}`} />
          </Grid>
        )}
      </Grid>
      {isLoading && <LinearProgress />}
      {!isLoading && (
        <AvniMaterialTable
          title=""
          ref={tableRef}
          columns={columns}
          fetchData={fetchData}
          options={{
            sorting: true,
            enableColumnFilters: false,
            pageSizeOptions: [10, 25, 100],
            pageSize: 10,
            rowStyle: ({ original }) => ({
              backgroundColor: original.voided ? "#DBDBDB" : "#fff"
            })
          }}
          actions={actions}
          route={`/appdesigner/${resourceURLName}`}
        />
      )}
      {redirect && <Redirect to={`/appDesigner/${resourceURLName}/create`} />}
    </Box>
  );
};

function areEqual(prevProps, nextProps) {
  return isEqual(prevProps, nextProps);
}

export default withRouter(memo(ResourceListView, areEqual));
