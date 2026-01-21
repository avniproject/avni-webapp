import { styled } from "@mui/material/styles";
import { TextField } from "@mui/material";

const StyledTextField = styled(TextField)({
  "& .MuiInputBase-input": {
    height: 20,
  },
});

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
      slotProps={{
        htmlInput: {
          ...props.inputProps,
          onWheel: (e) => e.target.blur(),
        },
      }}
    />
  );
};

export default InputField;
