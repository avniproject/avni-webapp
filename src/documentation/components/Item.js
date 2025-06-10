import React, { useState } from "react";
import { isFunction } from "lodash";
import { Add, Delete } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";
import { IconButton, Link } from "@mui/material";

const useStyles = makeStyles(theme => ({
  root: {
    cursor: "pointer",
    maxWidth: "90%",
    flex: 1,
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden"
  }
}));

export const Item = ({ name, onAdd, onDelete, level, disabled, onToggle, isSelected }) => {
  const [showIcons, setShowIcons] = useState(false);
  const classes = useStyles();
  const paddingLeft = level * 15;

  const renderWithLink = () => (
    <Link disabled className={classes.root} onClick={onToggle}>
      {renderWithoutLink()}
    </Link>
  );

  const renderWithoutLink = extraStyle => {
    const baseStyle = {
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      overflow: "hidden",
      paddingRight: 20
    };
    const nameStyle = extraStyle ? { ...extraStyle, ...baseStyle } : baseStyle;
    return <div style={nameStyle}>{name}</div>;
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        height: 30,
        paddingLeft,
        position: "relative",
        backgroundColor: showIcons || isSelected ? "rgba(145,145,145,0.37)" : "rgba(248,248,248,0.37)",
        whiteSpace: "nowrap",
        width: window.innerWidth / 5
      }}
      onMouseEnter={() => setShowIcons(true)}
      onMouseLeave={() => setShowIcons(false)}
    >
      {disabled ? renderWithoutLink({ color: "grey" }) : renderWithLink()}
      {(showIcons || disabled) && (
        <div style={{ alignSelf: "flex-end", position: "absolute", right: 0 }}>
          {isFunction(onAdd) && (
            <IconButton size={"small"} onClick={onAdd}>
              <Add />
            </IconButton>
          )}
          {isFunction(onDelete) && (
            <IconButton size={"small"} onClick={onDelete}>
              <Delete style={{ color: "rgba(175,1,25,0.59)" }} />
            </IconButton>
          )}
        </div>
      )}
    </div>
  );
};
