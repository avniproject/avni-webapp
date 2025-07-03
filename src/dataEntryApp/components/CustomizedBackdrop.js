import React from "react";
import { styled } from '@mui/material/styles';
import { Fade, CircularProgress } from "@mui/material";

const StyledBackdrop = styled('div')(({ theme }) => ({
  color: "#fff",
  zIndex: theme.zIndex.drawer + 1,
  position: "fixed",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  right: 0,
  bottom: 0,
  top: 0,
  left: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
}));

const CustomizedBackdrop = React.forwardRef(function Backdrop({ load }, ref) {
  const open = !load;
  return (
    <Fade in={open}>
      <StyledBackdrop data-mui-test="Backdrop" aria-hidden ref={ref}>
        <CircularProgress color="inherit" />
      </StyledBackdrop>
    </Fade>
  );
});

export default CustomizedBackdrop;