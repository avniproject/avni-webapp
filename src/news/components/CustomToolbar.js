import { Typography } from "@material-ui/core";
import { ActionButton } from "./ActionButton";
import React from "react";

export const CustomToolbar = ({ totalNews, setOpenCreate }) => {
  return (
    <div
      style={{
        padding: 20,
        display: "flex",
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Typography variant="h6">{`News broadcast`}</Typography>
        <Typography style={{ opacity: 0.7 }} variant="body2">
          {`A total of ${totalNews} news broadcast has been listed below`}
        </Typography>
      </div>
      <div style={{ display: "flex" }}>
        <ActionButton
          onClick={() => setOpenCreate(true)}
          variant="contained"
          style={{ paddingHorizontal: 10 }}
          size="medium"
        >
          {"Create a New Broadcast"}
        </ActionButton>
      </div>
    </div>
  );
};
