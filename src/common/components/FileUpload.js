import React from "react";
import { styled } from '@mui/material/styles';
import { Button, Grid } from "@mui/material";

const StyledGrid = styled(Grid)(({ theme }) => ({
  justifyContent: "flex-start",
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginLeft: theme.spacing(2),
}));

const StyledInput = styled('input')(({ theme }) => ({
  display: "none",
}));

const FileUpload = ({ onSelect, onUpload, canSelect, canUpload }) => {
  const onSelectWrapper = event => {
    const fileReader = new FileReader();
    event.target.files[0] && fileReader.readAsText(event.target.files[0]);
    const file = event.target.files[0];
    fileReader.onloadend = event => {
      const error = onSelect(event.target.result, file);
      error && alert(error);
    };
  };

  const handleClick = event => {
    event.target.value = null;
  };

  const onUploadWrapper = () => {
    onUpload();
  };

  return (
    <StyledGrid container direction="row" spacing={1}>
      <StyledButton variant="contained" component="label" disabled={!canSelect}>
        Choose File
        <StyledInput type="file" onChange={onSelectWrapper} onClick={handleClick} />
      </StyledButton>
      <StyledButton
        variant="contained"
        color="primary"
        aria-haspopup="false"
        onClick={onUploadWrapper}
        disabled={!canUpload}
      >
        Upload
      </StyledButton>
    </StyledGrid>
  );
};

export default FileUpload;