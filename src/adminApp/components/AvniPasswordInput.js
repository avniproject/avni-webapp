import React, { useState } from "react";
import { TextInput } from "react-admin";
import { ToolTipContainer } from "../../common/components/ToolTipContainer";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import { IconButton, InputAdornment } from "@material-ui/core";

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
              <IconButton onClick={handleClick}>
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
