import React from "react";
import { ToolTip } from "./ToolTip";

export const ToolTipContainer = ({ toolTipKey, styles, onHover, position, ...props }) => {
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <div style={styles || {}}>{props.children}</div>
      <div style={{ alignItems: "flex-end", flex: 1 }}>
        <ToolTip toolTipKey={toolTipKey} onHover={onHover} displayPosition={position} />
      </div>
    </div>
  );
};
