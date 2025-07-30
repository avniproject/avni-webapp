import * as React from "react";
import { useListContext } from "react-admin";
import {
  Box,
  Pagination as MuiPagination,
  Select,
  MenuItem,
  Typography
} from "@mui/material";

export const PrettyPagination: React.FC = () => {
  const {
    page,
    perPage,
    setPage,
    setPerPage,
    total,
    isLoading
  } = useListContext();

  const hasTotal = typeof total === "number";
  const pageCount = Math.max(1, Math.ceil((hasTotal ? total! : 0) / perPage));

  const from = hasTotal && total! > 0 ? (page - 1) * perPage + 1 : 0;
  const to = hasTotal && total! > 0 ? Math.min(total!, page * perPage) : 0;

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
        backgroundColor: "#f8fafc",
        position: "sticky",
        bottom: 0,
        zIndex: 1
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          flex: "0 0 auto"
        }}
      >
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", whiteSpace: "nowrap" }}
        >
          Rows per page
        </Typography>

        <Select
          size="small"
          value={perPage}
          onChange={e => {
            const next = Number(e.target.value);
            setPage(1);
            setPerPage(next);
          }}
          sx={{
            minWidth: 88,
            width: 88,
            flex: "0 0 auto",
            "& .MuiSelect-select": { py: 0.75, px: 1.25, borderRadius: 2 }
          }}
        >
          {[10, 25, 50, 100].map(opt => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </Select>

        <Typography
          variant="body2"
          sx={{ color: "text.secondary", whiteSpace: "nowrap" }}
        >
          {hasTotal ? `${from}-${to} of ${total}` : "— of —"}
        </Typography>
      </Box>

      <MuiPagination
        page={page}
        count={pageCount}
        onChange={(_, value) => setPage(value)}
        variant="outlined"
        shape="rounded"
        siblingCount={1}
        boundaryCount={1}
        disabled={isLoading}
        color="primary"
        sx={{
          "& .MuiPaginationItem-root": {
            borderRadius: 2,
            fontWeight: 600,
            color: "primary.main"
          },
          "& .MuiPaginationItem-root.Mui-selected": {
            backgroundColor: "primary.main",
            borderColor: "primary.main",
            color: "primary.contrastText"
          },
          "& .MuiPaginationItem-ellipsis": {
            color: "text.disabled"
          }
        }}
      />
    </Box>
  );
};
