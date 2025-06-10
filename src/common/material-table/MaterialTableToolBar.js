import { size } from "lodash";
import { Box } from "@mui/material";
import { Button } from "@mui/material";
import React from "react";

export class MaterialTableToolBarButton {
  eventHandler;
  activeOnlyOnSelected;
  text;

  constructor(eventHandler, activeOnlyOnSelected, text, askConfirmation = false) {
    this.eventHandler = eventHandler;
    this.activeOnlyOnSelected = activeOnlyOnSelected;
    this.text = text;
  }

  shouldBeDisabled(selectedRows) {
    const selectedRowSize = size(selectedRows);
    const noRowsSelected = selectedRowSize === 0;
    return this.activeOnlyOnSelected ? noRowsSelected : false;
  }
}

export function MaterialTableToolBar({ toolBarButtons, ...props }) {
  const { selectedRows } = props;

  return (
    <Box style={{ display: "flex", flexDirection: "row-reverse", marginBottom: 30 }}>
      {toolBarButtons.map(toolbarButton => {
        return (
          <Button
            key={toolbarButton.text}
            color="primary"
            variant="outlined"
            style={{ marginLeft: 10 }}
            disabled={toolbarButton.shouldBeDisabled(selectedRows)}
            onClick={() => toolbarButton.eventHandler(selectedRows)}
          >
            {toolbarButton.text}
          </Button>
        );
      })}
    </Box>
  );
}
