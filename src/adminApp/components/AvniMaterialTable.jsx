import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useRef,
  useCallback,
  useMemo
} from "react";
import { MaterialReactTable } from "material-react-table";
import { useLocation, useNavigate } from "react-router-dom";
import { IconButton, Box } from "@mui/material";
import { MRTPagination } from "../Util/MRTPagination.tsx";

const AvniMaterialTable = forwardRef(
  (
    {
      columns,
      fetchData,
      options = {},
      route = "",
      components = {},
      actions = [],
      ...restProps
    },
    ref
  ) => {
    const location = useLocation();
    const navigate = useNavigate();
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

    const [globalFilter, setGlobalFilter] = useState(() => {
      const query = new URLSearchParams(location.search);
      return query.get("search") || "";
    });

    const [columnFilters, setColumnFilters] = useState(() => {
      const query = new URLSearchParams(location.search);
      const filters = query.get("filters");
      return filters ? JSON.parse(decodeURIComponent(filters)) : [];
    });

    useEffect(() => {
      const query = new URLSearchParams(location.search);
      const pageFromUrl = query.get("page");
      const pageNumber = Number(pageFromUrl);
      if (pageFromUrl !== null && isNaN(pageNumber)) {
        navigate(`${currentPath}?page=0`, { replace: true });
      }
    }, [currentPath, location.search, navigate]);

    useEffect(() => {
      const query = new URLSearchParams(location.search);
      const pageFromUrl = Number(query.get("page")) || 0;
      const sortByFromUrl = query.get("sortBy");
      const sortDescFromUrl = query.get("sortDesc");
      const searchFromUrl = query.get("search") || "";
      const filtersFromUrl = query.get("filters");

      setPagination(prev => ({
        ...prev,
        pageIndex: pageFromUrl
      }));

      const newSorting = sortByFromUrl
        ? [{ id: sortByFromUrl, desc: sortDescFromUrl === "desc" }]
        : [];

      setSorting(prev => {
        if (
          prev.length !== newSorting.length ||
          prev[0]?.id !== newSorting[0]?.id ||
          prev[0]?.desc !== newSorting[0]?.desc
        ) {
          return newSorting;
        }
        return prev;
      });

      setGlobalFilter(searchFromUrl);

      const newColumnFilters = filtersFromUrl
        ? JSON.parse(decodeURIComponent(filtersFromUrl))
        : [];
      setColumnFilters(newColumnFilters);
    }, [location.search]);

    const loadData = useCallback(async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;
      setIsLoading(true);

      try {
        const fetchParams = {
          page: pagination.pageIndex,
          pageSize: pagination.pageSize,
          orderBy: sorting[0]?.id,
          orderDirection: sorting[0]?.desc ? "desc" : "asc",
          globalFilter: globalFilter,
          columnFilters: columnFilters,
          search: globalFilter
        };

        const response = await fetchData(fetchParams);

        const normalizedData = Array.isArray(response)
          ? { data: response, totalRecords: response.length }
          : response || { data: [], totalRecords: 0 };

        if (isMounted.current && !controller.signal.aborted) {
          setData(normalizedData.data || []);
          setTotalRecords(
            normalizedData.totalCount || normalizedData.totalRecords || 0
          );
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
    }, [
      pagination.pageIndex,
      pagination.pageSize,
      sorting,
      fetchData,
      globalFilter,
      columnFilters
    ]);

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

    const updateURL = useCallback(
      newParams => {
        const queryParams = new URLSearchParams();

        if (newParams.pageIndex !== undefined && newParams.pageIndex > 0) {
          queryParams.set("page", newParams.pageIndex.toString());
        }

        const currentSorting =
          newParams.sorting !== undefined ? newParams.sorting : sorting;
        if (currentSorting[0]?.id) {
          queryParams.set("sortBy", currentSorting[0].id);
          if (currentSorting[0].desc) {
            queryParams.set("sortDesc", "desc");
          }
        }

        const currentGlobalFilter =
          newParams.globalFilter !== undefined
            ? newParams.globalFilter
            : globalFilter;
        if (currentGlobalFilter) {
          queryParams.set("search", currentGlobalFilter);
        }

        const currentColumnFilters =
          newParams.columnFilters !== undefined
            ? newParams.columnFilters
            : columnFilters;
        if (currentColumnFilters.length > 0) {
          queryParams.set(
            "filters",
            encodeURIComponent(JSON.stringify(currentColumnFilters))
          );
        }

        const queryString = queryParams.toString();
        const newURL = queryString
          ? `${currentPath}?${queryString}`
          : currentPath;

        navigate(newURL, { replace: true });
      },
      [currentPath, navigate, sorting, globalFilter, columnFilters]
    );

    const handlePaginationChange = useCallback(
      updater => {
        setPagination(prev => {
          const newState =
            typeof updater === "function" ? updater(prev) : updater;
          const newPageIndex = newState.pageIndex ?? 0;

          updateURL({ pageIndex: newPageIndex });

          return { ...prev, ...newState };
        });
      },
      [updateURL]
    );

    const handleGlobalFilterChange = useCallback(
      filterValue => {
        setGlobalFilter(filterValue);
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
        updateURL({
          globalFilter: filterValue,
          pageIndex: 0
        });
      },
      [updateURL]
    );

    const handleColumnFiltersChange = useCallback(
      filters => {
        setColumnFilters(filters);
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
        updateURL({
          columnFilters: filters,
          pageIndex: 0
        });
      },
      [updateURL]
    );

    const handleSortingChange = useCallback(
      sortingUpdater => {
        setSorting(prev => {
          const newSorting =
            typeof sortingUpdater === "function"
              ? sortingUpdater(prev)
              : sortingUpdater;
          updateURL({ sorting: newSorting });
          return newSorting;
        });
      },
      [updateURL]
    );

    const memoizedColumns = useMemo(() => columns, [columns]);

    const paginationProps = useMemo(
      () => ({
        page: pagination.pageIndex + 1,
        perPage: pagination.pageSize,
        total: totalRecords,
        isLoading,
        pageSizeOptions: options.pageSizeOptions
      }),
      [pagination, totalRecords, isLoading, handlePaginationChange]
    );

    const tableProps = useMemo(
      () => ({
        enableColumnFilters: options.searching !== false,
        enableGlobalFilter: options.searching !== false,
        enableSorting: !!options.sorting,
        enableRowActions: actions.some(action => !action.isFreeAction),

        manualFiltering: true,
        manualGlobalFilter: true,

        renderRowActions: actions.some(action => !action.isFreeAction)
          ? ({ row }) => (
              <Box sx={{ display: "flex", flexDirection: "row", gap: "8px" }}>
                {actions
                  .filter(action => !action.isFreeAction)
                  .map((action, index) => {
                    const Icon = action.icon;
                    const disabled =
                      typeof action.disabled === "function"
                        ? action.disabled(row)
                        : action.disabled || false;

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
        renderBottomToolbar: () => <MRTPagination {...paginationProps} />,
        ...restProps,
        ...(components.topToolbar && {
          renderTopToolbar: components.topToolbar
        }),
        ...(components.bottomToolbar && {
          renderBottomToolbar: components.bottomToolbar
        })
      }),
      [
        options.searching,
        options.sorting,
        components.topToolbar,
        components.bottomToolbar,
        restProps,
        actions,
        paginationProps
      ]
    );

    useImperativeHandle(ref, () => ({
      refresh: loadData,
      resetFilters: () => {
        setGlobalFilter("");
        setColumnFilters([]);
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
        updateURL({ globalFilter: "", columnFilters: [], pageIndex: 0 });
      }
    }));

    return (
      <MaterialReactTable
        columns={memoizedColumns}
        data={data}
        manualPagination
        manualSorting
        manualFiltering
        manualGlobalFilter
        onPaginationChange={handlePaginationChange}
        onSortingChange={handleSortingChange}
        onGlobalFilterChange={handleGlobalFilterChange}
        onColumnFiltersChange={handleColumnFiltersChange}
        rowCount={totalRecords}
        state={{
          isLoading,
          pagination,
          sorting,
          globalFilter,
          columnFilters
        }}
        {...tableProps}
      />
    );
  }
);

export default AvniMaterialTable;
