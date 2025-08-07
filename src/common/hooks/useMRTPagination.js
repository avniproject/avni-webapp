import { useMemo } from "react";

export const useMRTPagination = ({ pagination, setPagination, totalRecords, isLoading, pageSizeOptions = [10, 20, 30] }) => {
  const paginationProps = useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      perPage: pagination.pageSize,
      total: totalRecords,
      isLoading,
      pageSizeOptions,
      setPage: page => setPagination(prev => ({ ...prev, pageIndex: page - 1 })),
      setPerPage: perPage => setPagination(prev => ({ ...prev, pageSize: perPage, pageIndex: 0 }))
    }),
    [pagination, totalRecords, isLoading, pageSizeOptions, setPagination]
  );

  return paginationProps;
};
