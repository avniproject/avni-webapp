import React from "react";
import { Dialog, DialogContent, DialogTitle, Box, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center"
          }}
        >
          <Box
            sx={{
              flexGrow: 1
            }}
          >
            {selectedFilter ? "Edit Filter" : "Create Filter"}
          </Box>
          <Box>
            <IconButton onClick={handleModalClose} size="large">
              <Close />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent style={{ height: "750px" }}>
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
