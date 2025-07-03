import { styled } from '@mui/material/styles';
import React, { useCallback, useEffect, useRef, useState } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";

// Source: https://codesandbox.io/s/opmco
const useClickOutside = (ref, handler) => {
  useEffect(() => {
    let startedInside = false;
    let startedWhenMounted = false;

    const listener = event => {
      // Do nothing if `mousedown` or `touchstart` started inside ref element
      if (startedInside || !startedWhenMounted) return;
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) return;

      handler(event);
    };

    const validateEventStart = event => {
      startedWhenMounted = ref.current;
      startedInside = ref.current && ref.current.contains(event.target);
    };

    document.addEventListener("mousedown", validateEventStart);
    document.addEventListener("touchstart", validateEventStart);
    document.addEventListener("click", listener);

    return () => {
      document.removeEventListener("mousedown", validateEventStart);
      document.removeEventListener("touchstart", validateEventStart);
      document.removeEventListener("click", listener);
    };
  }, [ref, handler]);
};

const StyledPicker = styled('div')({
  position: "relative",
  display: "flex",
  flexDirection: "row"
});

const StyledSwatch = styled('div')(({ color }) => ({
  width: "28px",
  height: "28px",
  marginRight: "6px",
  borderRadius: "8px",
  border: "3px solid #fff",
  boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(0, 0, 0, 0.1)",
  cursor: "pointer",
  backgroundColor: color
}));

const StyledPopOver = styled('div')({
  position: "absolute",
  top: "calc(100% + 2px)",
  left: "0",
  borderRadius: "9px",
  boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
  zIndex: 100
});

export const PopoverColorPicker = ({ color, onChange }) => {
  const popover = useRef();
  const [isOpen, toggle] = useState(false);

  const close = useCallback(() => toggle(false), []);
  useClickOutside(popover, close);

  return (
    <StyledPicker>
      <StyledSwatch color={color} onClick={() => toggle(true)} />
      {isOpen && (
        <StyledPopOver ref={popover}>
          <HexColorPicker color={color} onChange={onChange} />
        </StyledPopOver>
      )}
      <HexColorInput color={color} onChange={onChange} placeholder="Type a color" prefixed />
    </StyledPicker>
  );
};