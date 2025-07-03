import React from "react";
import { styled } from '@mui/material/styles';
import { TextField } from "@mui/material";

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-input": {
    height: 20, // Adjusted from 0 to a reasonable value for usability
  },
}));

const InputField = ({ type, value, onChange, ...props }) => {
  const getValue = () => {
    if (type === "number") {
      return value === 0 ? null : value;
    }
    return value;
  };

  return (
    <StyledTextField
      variant="outlined"
      type={type || "text"}
      value={getValue()}
      onChange={onChange}
      {...props}
    />
  );
};

export default InputField;