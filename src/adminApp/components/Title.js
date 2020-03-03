import React from "react";

export const Title = ({ record, title }) => {
  return (
    record && (
      <span>
        {title}: <b>{record.name}</b>
      </span>
    )
  );
};
