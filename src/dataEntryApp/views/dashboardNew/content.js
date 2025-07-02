import React from "react";
import { styled } from '@mui/material/styles';

const StyledContainer = styled('div')(({ theme }) => ({
  width: "100%",
  display: "flex",
  backgroundColor: "white",
  color: "black",
  height: "750px",
}));

export default function Header() {
  return (
    <StyledContainer>
      <label />
    </StyledContainer>
  );
}