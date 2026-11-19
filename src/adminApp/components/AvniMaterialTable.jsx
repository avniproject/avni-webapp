import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useRef,
  useCallback,
  useMemo
} from "react";
import { flushSync } from "react-dom";
import { MaterialReactTable } from "material-react-table";
import { useLocation, useNavigate } from "react-router-dom";
import { IconButton, Box } from "@mui/material";
import { MRTPagination } from "../Util/MRTPagination.tsx";
import { useMRTPagination } from "../../common/hooks/useMRTPagination";
import { appDesignerTableDefaults } from "./appDesignerTableDefaults";

const pageIndexFrom = search => {
  const page = Number(new URLSearchParams(search).get("page"));
  return Number.isInteger(page) && page > 0 ? page : 0;
};

const columnFiltersFrom = search => {
  try {
    const filters = JSON.parse(
      decodeURIComponent(new URLSearchParams(search).get("filters") || "[]")
    );
    return Array.isArray(filters) ? filters : [];
  } catch (e) {
    return [];
  }
};

const NO_SORTING = [];

const columnIdOf = column =>
  column.id ??
  column.accessorKey ??
  (typeof column.header === "string" ? column.header : undefined);

const sortableColumnIdsOf = (columns, isSortingEnabled) =>
  isSortingEnabled
    ? columns
        .filter(
          column =>
            column.enableSorting !== false &&
            (column.accessorKey || column.accessorFn)
        )
        .map(columnIdOf)
        .filter(Boolean)
    : [];

const sortingFrom = (search, defaultSorting, sortableColumnIds) => {
  const query = new URLSearchParams(search);
  const orderBy = query.get("sortBy");
  return sortableColumnIds.includes(orderBy)
    ? [{ id: orderBy, desc: query.get("sortDesc") === "desc" }]
    : defaultSorting;
};

const AvniMaterialTable = forwardRef(
  (
    {
      columns,
      fetchData,
      options = {},
      route = "",
      components = {},
      actions = [],
      defaultSorting: defaultSortingProp = NO_SORTING,
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
    const [isLoading, setIsLoading] = useState(true);

    const [pagination, setPagination] = useState(() => ({
      pageIndex: pageIndexFrom(location.search),
      pageSize: options.pageSize || 10
    }));

    const sortableColumnIdsKey = sortableColumnIdsOf(
      columns,
      !!options.sorting
    ).join("\n");
    const sortableColumnIds = useMemo(
      () => (sortableColumnIdsKey ? sortableColumnIdsKey.split("\n") : []),
      [sortableColumnIdsKey]
    );

    const defaultSortingKey = JSON.stringify(defaultSortingProp);
    const defaultSorting = useMemo(() => JSON.parse(defaultSortingKey), [
      defaultSortingKey
    ]);

    const [sorting, setSorting] = useState(() =>
      sortingFrom(location.search, defaultSorting, sortableColumnIds)
    );

    const [globalFilter, setGlobalFilter] = useState(() => {
      const query = new URLSearchParams(location.search);
      return query.get("search") || "";
    });

    const [showGlobalFilter, setShowGlobalFilter] = useState(
      () => !!globalFilter
    );

    const [columnFilters, setColumnFilters] = useState(() =>
      columnFiltersFrom(location.search)
    );

    useEffect(() => {
      const query = new URLSearchParams(location.search);
      let isCorrected = false;
      const pageFromUrl = query.get("page");
      if (pageFromUrl !== null) {
        const pageIndex = pageIndexFrom(location.search);
        if (String(pageIndex) !== pageFromUrl) {
          if (pageIndex > 0) query.set("page", String(pageIndex));
          else query.delete("page");
          isCorrected = true;
        }
      }
      const sortByFromUrl = query.get("sortBy");
      if (
        sortByFromUrl !== null &&
        columns.length > 0 &&
        !sortableColumnIds.includes(sortByFromUrl)
      ) {
        query.delete("sortBy");
        query.delete("sortDesc");
        isCorrected = true;
      }
      if (!isCorrected) return;
      const queryString = query.toString();
      navigate(queryString ? `${currentPath}?${queryString}` : currentPath, {
        replace: true
      });
    }, [
      currentPath,
      location.search,
      navigate,
      columns.length,
      sortableColumnIds
    ]);

    useEffect(() => {
      const query = new URLSearchParams(location.search);
      const pageFromUrl = pageIndexFrom(location.search);
      const searchFromUrl = query.get("search") || "";

      setPagination(prev =>
        prev.pageIndex === pageFromUrl
          ? prev
          : { ...prev, pageIndex: pageFromUrl }
      );

      const newSorting = sortingFrom(
        location.search,
        defaultSorting,
        sortableColumnIds
      );

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
      if (searchFromUrl) setShowGlobalFilter(true);

      const newColumnFilters = columnFiltersFrom(location.search);
      setColumnFilters(prev =>
        JSON.stringify(prev) === JSON.stringify(newColumnFilters)
          ? prev
          : newColumnFilters
      );
    }, [location.search, defaultSorting, sortableColumnIds]);

    const search = (globalFilter ?? "").trim();

    const loadData = useCallback(async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;
      setIsLoading(true);

      const isLatestRequest = () => abortControllerRef.current === controller;

      try {
        const fetchParams = {
          page: pagination.pageIndex,
          pageSize: pagination.pageSize,
          orderBy: sorting[0]?.id,
          orderDirection: sorting[0]?.desc ? "desc" : "asc",
          globalFilter: search,
          columnFilters: columnFilters,
          search
        };

        const response = await fetchData(fetchParams);

        const normalizedData = Array.isArray(response)
          ? { data: response, totalRecords: response.length }
          : response || { data: [], totalRecords: 0 };

        if (isMounted.current && isLatestRequest()) {
          setData(normalizedData.data || []);
          setTotalRecords(
            normalizedData.totalCount || normalizedData.totalRecords || 0
          );
        }
      } catch (err) {
        if (err.name !== "AbortError" && isMounted.current && isLatestRequest()) {
          console.error("Failed to fetch table data", err);
          setData([]);
          setTotalRecords(0);
        }
      } finally {
        if (isMounted.current && isLatestRequest()) {
          setIsLoading(false);
        }
      }
    }, [
      pagination.pageIndex,
      pagination.pageSize,
      sorting,
      fetchData,
      search,
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
        const search = filterValue ?? "";
        setGlobalFilter(search);
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
        updateURL({
          globalFilter: search,
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
        const newSorting =
          typeof sortingUpdater === "function"
            ? sortingUpdater(sorting)
            : sortingUpdater;
        flushSync(() => {
          setSorting(newSorting);
          setPagination(prev =>
            prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }
          );
        });
        updateURL({ sorting: newSorting, pageIndex: 0 });
      },
      [sorting, updateURL]
    );

    const memoizedColumns = useMemo(() => columns, [columns]);

    const paginationProps = useMRTPagination({
      pagination,
      setPagination: handlePaginationChange,
      totalRecords,
      isLoading,
      pageSizeOptions: options.pageSizeOptions
    });

    const tableProps = useMemo(
      () => ({
        enableColumnFilters: options.searching !== false,
        enableGlobalFilter: options.searching !== false,
        enableSorting: !!options.sorting,
        ...appDesignerTableDefaults,
        enableMultiSort: false,
        enableSortingRemoval: defaultSorting.length === 0,
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
        defaultSorting,
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
        onShowGlobalFilterChange={setShowGlobalFilter}
        rowCount={totalRecords}
        state={{
          isLoading,
          pagination,
          sorting,
          globalFilter,
          columnFilters,
          showGlobalFilter
        }}
        {...tableProps}
      />
    );
  }
);

export default AvniMaterialTable;
