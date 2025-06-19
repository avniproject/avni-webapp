import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef, useCallback, useMemo } from "react";
import { MaterialReactTable } from "material-react-table";
import { useLocation, useHistory } from "react-router-dom";
import { IconButton, Box, Button } from "@mui/material";

const AvniMaterialTable = forwardRef(
  ({ columns, fetchData, options = {}, route = "", components = {}, actions = [], ...restProps }, ref) => {
    const location = useLocation();
    const history = useHistory();
    const currentPath = route || location.pathname;
    const isMounted = useRef(true);
    const abortControllerRef = useRef(null);
    const [data, setData] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState(() => ({
      pageIndex: Number(new URLSearchParams(location.search).get("page")) || 0,
      pageSize: options.pageSize || 10
    }));
    const [sorting, setSorting] = useState(() => {
      const query = new URLSearchParams(location.search);
      const orderBy = query.get("sortBy");
      const orderDesc = query.get("sortDesc");
      return orderBy ? [{ id: orderBy, desc: orderDesc === "desc" }] : [];
    });

    useEffect(() => {
      const query = new URLSearchParams(location.search);
      const pageFromUrl = query.get("page");
      const pageNumber = Number(pageFromUrl);
      if (pageFromUrl !== null && isNaN(pageNumber)) {
        history.replace({
          pathname: currentPath,
          search: `?page=0`
        });
      }
    }, [currentPath, history]);

    useEffect(() => {
      const query = new URLSearchParams(location.search);
      const pageFromUrl = Number(query.get("page")) || 0;
      const sortByFromUrl = query.get("sortBy");
      const sortDescFromUrl = query.get("sortDesc");

      setPagination(prev => ({
        ...prev,
        pageIndex: pageFromUrl
      }));

      const newSorting = sortByFromUrl ? [{ id: sortByFromUrl, desc: sortDescFromUrl === "desc" }] : [];
      setSorting(prev => {
        if (prev.length !== newSorting.length || prev[0]?.id !== newSorting[0]?.id || prev[0]?.desc !== newSorting[0]?.desc) {
          return newSorting;
        }
        return prev;
      });
    }, [location.search]);

    const loadData = useCallback(async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;
      setIsLoading(true);

      try {
        const response = await fetchData({
          page: pagination.pageIndex,
          pageSize: pagination.pageSize,
          orderBy: sorting[0]?.id,
          orderDirection: sorting[0]?.desc ? "desc" : "asc"
        });

        const normalizedData = Array.isArray(response)
          ? { data: response, totalRecords: response.length }
          : response || { data: [], totalRecords: 0 };
        if (isMounted.current && !controller.signal.aborted) {
          setData(normalizedData.data || []);
          setTotalRecords(normalizedData.totalCount || normalizedData.totalRecords || 0);
        }
      } catch (err) {
        if (err.name !== "AbortError" && isMounted.current) {
          console.error("Failed to fetch table data", err);
          setData([]);
          setTotalRecords(0);
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    }, [pagination.pageIndex, pagination.pageSize, sorting, fetchData]);

    useEffect(() => {
      isMounted.current = true;
      loadData();
      return () => {
        isMounted.current = false;
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      };
    }, [loadData]);

    const handlePaginationChange = useCallback(
      updater => {
        setPagination(prev => {
          const newState = typeof updater === "function" ? updater(prev) : updater;
          const newPageIndex = newState.pageIndex ?? 0;
          if (newPageIndex !== prev.pageIndex) {
            const queryParams = new URLSearchParams({
              page: newPageIndex.toString(),
              ...(sorting[0]?.id && { sortBy: sorting[0].id }),
              ...(sorting[0]?.desc && { sortDesc: "desc" })
            });
            history.push({
              pathname: currentPath,
              search: queryParams.toString()
            });
          }
          return { ...prev, ...newState };
        });
      },
      [currentPath, history, sorting]
    );

    const memoizedColumns = useMemo(() => columns, [columns]);

    const tableProps = useMemo(
      () => ({
        enableColumnFilters: options.searching !== false,
        enableSorting: !!options.sorting,
        enableRowActions: actions.some(action => !action.isFreeAction),
        renderTopToolbarCustomActions: ({ table }) => (
          <Box sx={{ display: "flex", gap: "8px" }}>
            {actions
              .filter(action => action.isFreeAction)
              .map((action, index) => {
                const Icon = action.icon;
                const disabled = action.disabled || false;
                return (
                  <Button
                    key={index}
                    title={action.tooltip}
                    disabled={disabled}
                    onClick={e => !disabled && action.onClick(e, table)}
                    startIcon={<Icon />}
                    variant="outlined"
                    size="small"
                  >
                    {action.tooltip}
                  </Button>
                );
              })}
          </Box>
        ),
        renderRowActions: actions.some(action => !action.isFreeAction)
          ? ({ row }) => (
              <Box sx={{ display: "flex", flexDirection: "row", gap: "8px" }}>
                {actions
                  .filter(action => !action.isFreeAction)
                  .map((action, index) => {
                    const Icon = action.icon;
                    const disabled = typeof action.disabled === "function" ? action.disabled(row) : action.disabled || false;
                    return (
                      <IconButton
                        key={index}
                        title={action.tooltip}
                        disabled={disabled}
                        onClick={e => !disabled && action.onClick(e, row)}
                        size="medium"
                      >
                        <Icon fontSize="medium" sx={{ color: "black" }} />
                      </IconButton>
                    );
                  })}
              </Box>
            )
          : undefined,
        ...restProps,
        ...(components.topToolbar && { renderTopToolbar: components.topToolbar }),
        ...(components.bottomToolbar && { renderBottomToolbar: components.bottomToolbar })
      }),
      [options.searching, options.sorting, components.topToolbar, components.bottomToolbar, restProps, actions]
    );

    useImperativeHandle(ref, () => ({
      refresh: loadData
    }));

    return (
      <MaterialReactTable
        columns={memoizedColumns}
        data={data}
        manualPagination
        manualSorting
        onPaginationChange={handlePaginationChange}
        onSortingChange={setSorting}
        rowCount={totalRecords}
        state={{
          isLoading,
          pagination,
          sorting
        }}
        {...tableProps}
      />
    );
  }
);

export default AvniMaterialTable;
