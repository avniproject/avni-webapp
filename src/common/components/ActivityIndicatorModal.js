import React from "react";
import { styled } from '@mui/material/styles';
import { CircularProgress, Modal } from "@mui/material";
import MuiComponentHelper from "../utils/MuiComponentHelper";

const StyledProgress = styled(CircularProgress)(({ theme }) => ({
  position: "absolute",
  top: "30%",
  left: "50%",
  zIndex: 1
}));

const ActivityIndicatorModal = ({ open }) => {
  return (
    <Modal onClose={MuiComponentHelper.getDialogClosingHandler()} open={open}>
      <StyledProgress size={150} />
    </Modal>
  );
};

export default ActivityIndicatorModal;