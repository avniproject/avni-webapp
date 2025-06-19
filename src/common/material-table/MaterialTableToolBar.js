import { size } from "lodash";
import { Box, Button } from "@mui/material";
import React from "react";

export class MaterialTableToolBarButton {
  eventHandler: (selectedRows: any[]) => void;
  activeOnlyOnSelected: boolean;
  text: string;
  askConfirmation: boolean;

  constructor(eventHandler: (selectedRows: any[]) => void, activeOnlyOnSelected: boolean, text: string, askConfirmation: boolean = false) {
    this.eventHandler = eventHandler;
    this.activeOnlyOnSelected = activeOnlyOnSelected;
    this.text = text;
    this.askConfirmation = askConfirmation;
  }

  shouldBeDisabled(selectedRows: any[]): boolean {
    const selectedRowSize = size(selectedRows);
    const noRowsSelected = selectedRowSize === 0;
    return this.activeOnlyOnSelected ? noRowsSelected : false;
  }
}

interface MaterialTableToolBarProps {
  toolBarButtons: MaterialTableToolBarButton[];
  selectedRows: any[];
}

export function MaterialTableToolBar({ toolBarButtons, selectedRows }: MaterialTableToolBarProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "row-reverse", mb: 3 }}>
      {toolBarButtons.map(toolbarButton => (
        <Button
          key={toolbarButton.text}
          color="primary"
          variant="outlined"
          sx={{ ml: 1 }}
          disabled={toolbarButton.shouldBeDisabled(selectedRows)}
          onClick={() => toolbarButton.eventHandler(selectedRows)}
        >
          {toolbarButton.text}
        </Button>
      ))}
    </Box>
  );
}
