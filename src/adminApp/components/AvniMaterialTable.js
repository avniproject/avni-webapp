import React, { forwardRef, Fragment, useEffect, useState } from "react";
import MaterialTable from "material-table";
import { TablePagination } from "@mui/material";
import { useHistory, useLocation } from "react-router-dom";
import MaterialTableIcons from "../../common/material-table/MaterialTableIcons";

const AvniMaterialTable = forwardRef(({ fetchData, options, components, route, ...props }, tableRef) => {
  const [initialPage, setInitialPage] = useState(0);
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const tablePage = Number(query.get("page"));

  const history = useHistory();

  const handleFetchData = query => {
    return fetchData({ ...query, page: initialPage });
  };

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.onChangePage({}, tablePage);
    }
    setInitialPage(tablePage);
  }, [tablePage]);

  return (
    <>
      <MaterialTable
        icons={MaterialTableIcons}
        tableRef={tableRef}
        data={typeof fetchData === "function" ? handleFetchData : fetchData}
        components={{
          Container: props => <Fragment>{props.children}</Fragment>,
          Pagination: paginationProps => {
            const { ActionsComponent, onChangePage, ...tablePaginationProps } = paginationProps;
            return (
              <TablePagination
                {...tablePaginationProps}
                onPageChange={(event, page) => {
                  history.push(`${route}?page=${page}`);
                  setInitialPage(Number(page));
                  onChangePage(event, page);
                }}
                ActionsComponent={subprops => <ActionsComponent {...subprops} />}
              />
            );
          },
          ...components
        }}
        options={{ ...options, initialPage }}
        {...props}
      />
    </>
  );
});

export default AvniMaterialTable;
