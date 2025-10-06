import React from "react";
import { Box, Button } from "@mui/material";
import { httpClient as http } from "common/utils/httpClient";
import { STATUS } from "./RuleFailureTelemetryList";

const RuleFailureToolbar = ({
  tableRef,
  selectedRows,
  selectedStatus,
  onSelectionChange,
}) => {
  const handleRuleFailures = (close) => {
    const selected = selectedRows || [];

    if (selected.length === 0) {
      alert("Please select at least one error to close.");
      return;
    }

    const request = {
      params: {
        ids: selected.map((row) => row.original?.id || row.id).join(","),
        isClosed: close,
      },
    };

    http
      .put("/web/ruleFailureTelemetry", null, request)
      .then(() => {
        if (tableRef.current) {
          tableRef.current.refresh();
          onSelectionChange?.([]);
        }
      })
      .catch((error) => {
        console.error("Failed to close selected errors:", error);
        alert("Failed to close selected errors. Please try again.");
      });
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2, gap: 2 }}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleRuleFailures(true)}
        disabled={selectedRows.length === 0 || selectedStatus === STATUS.CLOSED}
      >
        Close Errors
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleRuleFailures(false)}
        disabled={selectedRows.length === 0 || selectedStatus === STATUS.OPEN}
      >
        Reopen Errors
      </Button>
    </Box>
  );
};

export default RuleFailureToolbar;
