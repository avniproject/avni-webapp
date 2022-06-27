import React from "react";
import { isFunction } from "lodash";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Close";
import { IconButton } from "@material-ui/core";
import Colors from "../../dataEntryApp/Colors";

export const Item = ({ name, onAdd, onDelete }) => {
  return (
    <div
      style={{ display: "flex", flexDirection: "row", alignItems: "center", whiteSpace: "nowrap" }}
    >
      <div style={{ flexWrap: "no-wrap" }}>{name}</div>
      <div style={{ marginRight: 10 }} />
      <div style={{ alignSelf: "flex-end" }}>
        {isFunction(onAdd) && (
          <IconButton size={"small"} onClick={onAdd}>
            <AddIcon />
          </IconButton>
        )}
        {isFunction(onDelete) && (
          <IconButton size={"small"} onClick={onDelete}>
            <DeleteIcon style={{ color: Colors.ValidationError }} />
          </IconButton>
        )}
      </div>
    </div>
  );
};
