import React from "react";
import Dialog from "@material-ui/core/Dialog";
import { DialogContent, DialogTitle } from "@material-ui/core";
import { CreateEditFilters } from "../../../adminApp/components/CreateEditFilters";
import { omitTableData } from "../../../adminApp/CustomFilters";
import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

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
        <CreateEditFilters
          filterType={"myDashboardFilters"}
          omitTableData={omitTableData}
          selectedFilter={selectedFilter}
          operationalModules={operationalModules}
          settings={{}}
          documentationFileName={null}
          dashboardFilterSave={newFilter => {
            dashboardDispatch({
              type: selectedFilter ? "editFilter" : "addFilter",
              payload: { dashboard, newFilter, selectedFilter }
            });
            setShowAddFilterModal(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
