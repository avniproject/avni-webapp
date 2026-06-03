import { styled } from "@mui/material/styles";
import { useCallback, useEffect, useRef, useState } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";

// Source: https://codesandbox.io/s/opmco
const useClickOutside = (ref, handler) => {
  useEffect(() => {
    let startedInside = false;
    let startedWhenMounted = false;

    const listener = (event) => {
      // Do nothing if `mousedown` or `touchstart` started inside ref element
      if (startedInside || !startedWhenMounted) return;
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) return;

      handler(event);
    };

    const validateEventStart = (event) => {
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

const StyledPicker = styled("div")({
  position: "relative",
  display: "flex",
  flexDirection: "row",
});

const StyledSwatch = styled("div")(({ color }) => ({
  width: "28px",
  height: "28px",
  marginRight: "6px",
  borderRadius: "8px",
  border: "3px solid #fff",
  boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(0, 0, 0, 0.1)",
  cursor: "pointer",
  backgroundColor: color,
}));

const StyledPopOver = styled("div")({
  position: "absolute",
  top: "calc(100% + 2px)",
  left: "0",
  borderRadius: "9px",
  boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
  zIndex: 100,
  background: "#fff",
  padding: "8px",
});

const StyledPalette = styled("div")({
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  gap: "6px",
  marginBottom: "8px",
});

const StyledPaletteSwatch = styled("button")({
  width: "24px",
  height: "24px",
  padding: 0,
  borderRadius: "6px",
  cursor: "pointer",
});

const sameColor = (a, b) => (a || "").toLowerCase() === (b || "").toLowerCase();

export const PopoverColorPicker = ({ color, onChange, paletteColors }) => {
  const popover = useRef();
  const [isOpen, toggle] = useState(false);

  const close = useCallback(() => toggle(false), []);
  useClickOutside(popover, close);

  return (
    <StyledPicker>
      <StyledSwatch color={color} onClick={() => toggle(true)} />
      {isOpen && (
        <StyledPopOver ref={popover}>
          {paletteColors && paletteColors.length > 0 && (
            <StyledPalette>
              {paletteColors.map((paletteColor) => (
                <StyledPaletteSwatch
                  key={paletteColor}
                  type="button"
                  title={paletteColor}
                  style={{
                    backgroundColor: paletteColor,
                    border: sameColor(paletteColor, color)
                      ? "2px solid #1976d2"
                      : "1px solid rgba(0, 0, 0, 0.2)",
                  }}
                  onClick={() => onChange(paletteColor)}
                />
              ))}
            </StyledPalette>
          )}
          <HexColorPicker color={color} onChange={onChange} />
        </StyledPopOver>
      )}
      <HexColorInput
        color={color}
        onChange={onChange}
        placeholder="Type a color"
        prefixed
      />
    </StyledPicker>
  );
};
