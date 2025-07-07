import { useState } from "react";
import { TextInput } from "react-admin";
import { ToolTipContainer } from "../../common/components/ToolTipContainer";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton, InputAdornment } from "@mui/material";

export const AvniPasswordInput = ({ toolTipKey, initiallyVisible = false, ...props }) => {
  const [visible, setVisible] = useState(initiallyVisible);
  const handleClick = () => {
    setVisible(!visible);
  };

  return (
    <ToolTipContainer toolTipKey={toolTipKey}>
      <TextInput
        {...props}
        type={visible ? "text" : "password"}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleClick} size="large">
                {visible ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          ),
          autoComplete: "new-password"
        }}
      />
      {props.children}
    </ToolTipContainer>
  );
};
