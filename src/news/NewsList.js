import { useEffect, useState, useMemo } from "react";
import { MaterialReactTable } from "material-react-table";
import { DocumentationContainer } from "../common/components/DocumentationContainer";
import ScreenWithAppBar from "../common/components/ScreenWithAppBar";
import API from "./api";
import { getFormattedDateTime } from "../adminApp/components/AuditUtil";
import { isNil } from "lodash";
import { Paper, Box } from "@mui/material";
import { CustomToolbar } from "./components/CustomToolbar";
import { CreateEditNews } from "./CreateEditNews";
import UserInfo from "../common/model/UserInfo";
import { connect } from "react-redux";
import { Privilege } from "openchs-models";
import { useLocation, useHistory } from "react-router-dom";

function NewsList({ userInfo }) {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [sorting, setSorting] = useState([{ id: "lastModifiedDateTime", desc: true }]);
  const location = useLocation();
  const history = useHistory();

  const [pagination, setPagination] = useState(() => ({
    pageIndex: Number(new URLSearchParams(location.search).get("page")) || 0,
    pageSize: 10
  }));

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const pageFromUrl = Number(query.get("page")) || 0;
    if (query.get("page") && isNaN(pageFromUrl)) {
      history.replace({
        pathname: location.pathname,
        search: `?page=0`
      });
      return;
    }
    setPagination(prev => ({ ...prev, pageIndex: pageFromUrl }));
  }, [location.search, history]);

  useEffect(() => {
    setIsLoading(true);
    API.getNews()
      .then(data => {
        setNews(data || []);
      })
      .catch(() => {
        setNews([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [openCreate]);

  const handlePaginationChange = updater => {
    setPagination(prev => {
      const newState = typeof updater === "function" ? updater(prev) : updater;
      const newPageIndex = newState.pageIndex ?? 0;
      if (newPageIndex !== prev.pageIndex) {
        history.push({
          pathname: location.pathname,
          search: `?page=${newPageIndex}`
        });
      }
      return { ...prev, ...newState };
    });
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Title"
      },
      {
        accessorKey: "createdDateTime",
        header: "Created On",
        Cell: ({ row }) => getFormattedDateTime(row.original.createdDateTime)
      },
      {
        accessorKey: "lastModifiedDateTime",
        header: "Modified On",
        Cell: ({ row }) => getFormattedDateTime(row.original.lastModifiedDateTime)
      },
      {
        accessorKey: "publishedDate",
        header: "Published On",
        Cell: ({ row }) => (isNil(row.original.publishedDate) ? "-" : getFormattedDateTime(row.original.publishedDate))
      },
      {
        id: "action",
        header: "Action",
        enableSorting: false,
        enableColumnFilter: false,
        Cell: ({ row }) => <a href={`#/broadcast/news/${row.original.id}/details`}>See details</a>
      }
    ],
    []
  );

  const canEditNews = UserInfo.hasPrivilege(userInfo, Privilege.PrivilegeType.EditNews);

  return (
    <ScreenWithAppBar appbarTitle="News Broadcast">
      <DocumentationContainer filename="NewsBroadcast.md">
        <Paper sx={{ marginBottom: "15px", marginTop: "15px" }}>
          <Box sx={{ position: "relative" }}>
            <MaterialReactTable
              columns={columns}
              data={news}
              getRowId={row => row.id}
              initialState={{
                pagination: { pageSize: 10, pageIndex: 0 },
                density: "compact"
              }}
              muiTableProps={{
                sx: {
                  "& .MuiTableHead-root": {
                    zIndex: 1,
                    color: "rgb(68, 68, 68)",
                    fontWeight: "bold"
                  }
                }
              }}
              muiTableBodyRowProps={{
                sx: {
                  color: "rgb(68, 68, 68)",
                  opacity: ".9"
                }
              }}
              enableSorting
              enableGlobalFilter={false}
              enableColumnFilters={false}
              enableTopToolbar={canEditNews}
              renderTopToolbarCustomActions={() => canEditNews && <CustomToolbar setOpenCreate={setOpenCreate} totalNews={news.length} />}
              state={{ isLoading, pagination, sorting }}
              onPaginationChange={handlePaginationChange}
              onSortingChange={setSorting}
            />
          </Box>
        </Paper>
        <CreateEditNews open={openCreate} headerTitle="Add news broadcast" handleClose={() => setOpenCreate(false)} edit={false} />
      </DocumentationContainer>
    </ScreenWithAppBar>
  );
}

const mapStateToProps = state => ({
  userInfo: state.app.userInfo
});

export default connect(mapStateToProps)(NewsList);
