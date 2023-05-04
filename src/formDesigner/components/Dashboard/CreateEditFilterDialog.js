import React from "react";
import Dialog from "@material-ui/core/Dialog";
import { DialogContent, DialogTitle } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import { CreateEditFiltersV2 } from "../../../adminApp/components/CreateEditFiltersV2";

export const CreateEditFilterDialog = ({
  showAddFilterModal,
  handleModalClose,
  selectedFilter,
  operationalModules,
  dashboardDispatch,
  dashboard,
  setShowAddFilterModal
}) => {
  return (
    <Dialog open={showAddFilterModal} onClose={handleModalClose}>
      <DialogTitle id="id">
        <Box display="flex" alignItems="center">
          <Box flexGrow={1}>{selectedFilter ? "Edit Filter" : "Create Filter"}</Box>
          <Box>
            <IconButton onClick={handleModalClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent style={{ height: "600px" }}>
        <CreateEditFiltersV2
          selectedFilter={selectedFilter}
          operationalModules={operationalModules}
          documentationFileName={null}
          dashboardFilterSave={modifiedFilter => {
            dashboardDispatch({
              type: selectedFilter ? "editFilter" : "addFilter",
              payload: { dashboard, modifiedFilter, selectedFilter }
            });
            setShowAddFilterModal(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
