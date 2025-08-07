import * as React from "react";
import {
  Box,
  Pagination as MuiPagination,
  Select,
  MenuItem,
  Typography
} from "@mui/material";

interface MRTPaginationProps {
  page: number; // 1-based
  perPage: number;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  total: number;
  isLoading: boolean;
  pageSizeOptions?: number[];
  customLabel?: string; // Custom label for special cases
  hasNextPage?: boolean; // Custom next page control
}

export const MRTPagination: React.FC<MRTPaginationProps> = ({
  page,
  perPage,
  setPage,
  setPerPage,
  total,
  isLoading,
  pageSizeOptions = [10, 20, 30],
  customLabel,
  hasNextPage
}) => {
  const hasTotal = typeof total === "number" && total >= 0;
  const pageCount = hasTotal
    ? Math.max(1, Math.ceil(total / perPage))
    : page + (hasNextPage !== false ? 1 : 0);

  const from = hasTotal && total > 0 ? (page - 1) * perPage + 1 : 0;
  const to = hasTotal && total > 0 ? Math.min(total, page * perPage) : 0;

  // Ensure current perPage is included in options if not already present
  const validatedOptions = React.useMemo(() => {
    const options = [...pageSizeOptions];
    if (!options.includes(perPage)) {
      options.push(perPage);
      options.sort((a, b) => a - b);
    }
    return options;
  }, [pageSizeOptions, perPage]);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        flexWrap: "wrap",
        p: 1.5,
        borderTop: "1px solid",
        borderColor: "divider",
        backgroundColor: "inherit",
        position: "sticky",
        bottom: 0,
        zIndex: 1
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Rows per page:
        </Typography>
        <Select
          size="small"
          value={perPage}
          onChange={e => {
            const next = Number(e.target.value);
            setPage(1); // Reset to first page
            setPerPage(next);
          }}
          sx={{ minWidth: 80, "& .MuiSelect-select": { py: 0.75 } }}
          disabled={isLoading}
          MenuProps={{
            anchorOrigin: {
              vertical: "top",
              horizontal: "left"
            },
            transformOrigin: {
              vertical: "bottom",
              horizontal: "left"
            }
          }}
        >
          {validatedOptions.map(opt => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </Select>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {customLabel ||
            (hasTotal ? `${from}-${to} of ${total}` : "No records")}
        </Typography>
      </Box>
      <MuiPagination
        page={page}
        count={pageCount}
        onChange={(_, value) => setPage(value)}
        variant="outlined"
        shape="rounded"
        disabled={isLoading}
        color="primary"
        siblingCount={1}
        boundaryCount={2}
        sx={{
          "& .MuiPaginationItem-root": {
            fontWeight: 500,
            color: "primary.main"
          },
          "& .MuiPaginationItem-root.Mui-selected": {
            backgroundColor: "primary.main",
            color: "white"
          },
          "& .MuiPaginationItem-previous": {
            opacity: page === 1 ? 0.5 : 1,
            pointerEvents: page === 1 ? "none" : "auto"
          },
          "& .MuiPaginationItem-next": {
            opacity:
              hasNextPage === false || (hasTotal && page >= pageCount)
                ? 0.5
                : 1,
            pointerEvents:
              hasNextPage === false || (hasTotal && page >= pageCount)
                ? "none"
                : "auto"
          }
        }}
      />
    </Box>
  );
};
