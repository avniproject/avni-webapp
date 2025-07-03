import React from "react";
import { styled } from '@mui/material/styles';
import { Button } from "@mui/material";

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(1),
  paddingLeft: 0,
  marginBottom: theme.spacing(1),
}));

const StyledIcon = styled('span')(({ theme }) => ({
  marginRight: theme.spacing(1), // 8px
}));

const IconButton = ({ onClick, Icon, label, disabled }) => (
  <StyledButton color="primary" size="small" onClick={onClick} disabled={disabled}>
    <StyledIcon as={Icon} />
    {label}
  </StyledButton>
);

export default IconButton;